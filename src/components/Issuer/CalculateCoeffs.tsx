import { Button, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCoeffs } from "../../hooks/useCalculations";
import { StringValues } from "../../services/calculateServices";
import useFilesStore from "../CertsForm/useFilesStore";
import { useIssuerStore } from "../StepsIndicator/useStepsStores";
import useResultsStore from "./useResultsStore";

const CalculateCoeffs = () => {
  const { filesProps } = useFilesStore();
  const { coeffs, setCoeffsResult } = useResultsStore();
  const hashObj: StringValues = {
    values: filesProps.map((file) => file.fileHash),
  };
  const { toggleDone } = useIssuerStore();
  const { data: resultObj, error, isLoading } = useCoeffs(hashObj);
  const [disabled, setDisabled] = useState(true);
  error ? toast.error(error.message) : null;

  return (
    <>
      {resultObj && (
        <Heading as="h1" size="md">
          Remember to put this file inside /server folder
        </Heading>
      )}
      <Button
        colorScheme="blue"
        variant="solid"
        onClick={() => {
          resultObj ? setCoeffsResult(resultObj) : null;
          setDisabled(!disabled);
          setTimeout(() => {
            toggleDone();
          }, 5000);
        }}
        isLoading={isLoading}
        isDisabled={!disabled}
      >
        CONFIRM
      </Button>
      {disabled && (
        <div>
          <p>Coefficients preview: </p>
          <pre>
            {JSON.stringify(
              resultObj &&
                Object.fromEntries(Object.entries(resultObj).slice(0, 10)),
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </>
  );
};

export default CalculateCoeffs;
