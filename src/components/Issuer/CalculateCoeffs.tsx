import { Button, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCoeffs } from "../../hooks/useCalculations";
import { StringValues } from "../../services/calculateServices";
import useFilesStore from "../../hooks/useFilesStore";
import { useIssuerStore } from "../../hooks/useStepsStores";
import useResultsStore from "../../hooks/useResultsStore";

const CalculateCoeffs = () => {
  const { filesProps } = useFilesStore();
  const { setCoeffsResult } = useResultsStore();
  const hashObj: StringValues = {
    values: filesProps.map((file) => file.fileHash),
  };
  const { toggleDone } = useIssuerStore();
  const { data: resultObj, error, isLoading } = useCoeffs(hashObj);
  const [disabled, setDisabled] = useState(true);
  error ? toast.error(error.message) : null;

  return (
    <>
      {resultObj ?
        <Heading as="h1" size="md">
          These are the coefficients of the polynomials generated from your
          certificates!
        </Heading> : <Heading as="h1" size="md">
          Calculating coefficients for the polynomials generated from your
          certificates!
        </Heading>
      }
      <Button
        colorScheme="blue"
        variant="solid"
        onClick={() => {
          resultObj ? setCoeffsResult(resultObj) : null;
          setDisabled(!disabled);
          toggleDone();
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
