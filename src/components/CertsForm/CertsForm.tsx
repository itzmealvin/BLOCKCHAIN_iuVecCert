import { Button, FormControl, FormErrorMessage, FormLabel, Heading, HStack, Input } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import FilesServices, { FileDetails, FileProps } from "../../services/FilesServices";
import { useIssuerStore } from "../StepsIndicator/useStepsStores";
import useFilesStore from "./useFilesStore";

const schema = (mode: "CREATE" | "VERIFY") => {
  return z.object({
    certificates: z
      .instanceof(FileList)
      .refine(
        (file) => (mode === "CREATE" ? file?.length >= 2 : file?.length === 1),
        mode === "CREATE"
          ? "At least 2 certificates are required!"
          : "At most 1 certificate is allowed!",
      ),
  });
};

interface Props {
  mode: "CREATE" | "VERIFY";
}

const CertsForm = ({ mode }: Props) => {
  const { setFilesProps, setFilesDetails } = useFilesStore();
  const { isDone, toggleDone } = useIssuerStore();
  const chosenSchema = schema(mode);
  type InputSchema = z.infer<typeof chosenSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InputSchema>({ resolver: zodResolver(chosenSchema) });

  const onCreateSubmit = (data: InputSchema) => {
    const resultPromises: [Promise<FileDetails[]>, Promise<FileProps[]>] = [
      FilesServices.generateFilesProps(data.certificates),
      FilesServices.hashFiles(data.certificates),
    ];
    toast
      .promise(Promise.all(resultPromises), {
        pending: "Files are being processed",
        success: "All files hashed!",
        error: "An unknown error occurred!",
      })
      .then((res): void => {
        const [detailsArray, propsArray] = res;
        setFilesDetails(detailsArray);
        setFilesProps(propsArray);
        reset();
        if (!isDone) toggleDone();
      })
      .catch((error): void => {
        toast.error(error);
        return;
      });
  };

  const onVerifySubmit = (data: InputSchema) => {
  };
  //   const resultPromise: Promise<MetaDataObj> = FilesServices.getMetaObj(
  //     data.certificates[0],
  //   );
  //   toast
  //     .promise(resultPromise, {
  //       pending: "Metadata are being retrieved",
  //       success: "Retrieved metadata!",
  //       error: "An unknown error occurred!",
  //     })
  //     .then((res): void => {
  //       console.log(res);
  //       reset();
  //       if (!isDone) toggleDone();
  //     })
  //     .catch((error): void => {
  //       toast.error(error);
  //       return;
  //     });
  // };

  return (<>
  {mode === "CREATE" ?
    <Heading as="h1" size="md">
      Upload your certificate batch (minimum 2 required)!
    </Heading> :
    <Heading as="h1" size="md">
      Upload your embedded certificate to verify/revoke it!
    </Heading>}
    <form
      onSubmit={handleSubmit((data) => {
        mode === "CREATE" ? onCreateSubmit(data) : onVerifySubmit(data);
      })}
    >
      <HStack spacing={5}>
        <FormControl isInvalid={!!errors.certificates}>
          <FormLabel htmlFor="certificates">
            {mode === "CREATE" ? "" : "Embedded"} Certificates:
          </FormLabel>
          <Input
            {...register("certificates")}
            id="certificates"
            type="file"
            accept=".pdf"
            multiple={true}
          />
          <FormErrorMessage>{errors.certificates?.message}</FormErrorMessage>
        </FormControl>
        <Button colorScheme="blue" variant="solid" type="submit" marginTop={3}>
          PROCESS
        </Button>
      </HStack>
    </form></>
  );
};

export default CertsForm;
