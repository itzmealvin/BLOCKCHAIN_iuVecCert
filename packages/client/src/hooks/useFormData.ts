import { PDFDocument } from "pdf-lib";
import { useEffect, useState } from "react";

/**
 * Hook to be used to build the form data
 * @param inputBuffer The PDF certificate buffer to be extracted from
 */
export const useFormData = (inputBuffer: Uint8Array | null) => {
  const [formData, setFormData] = useState<{ [key: string]: string } | null>(
    null,
  );

  useEffect(() => {
    const excludedFields = ["reg", "ranking"];
    const loadFormData = async () => {
      if (!inputBuffer) return;

      const certDoc = await PDFDocument.load(inputBuffer);
      const form = certDoc.getForm();
      const fieldData: { [key: string]: string } = {};

      form.getFields().forEach((field) => {
        const fieldName = field.getName();
        if (excludedFields.some((exclude) => fieldName.includes(exclude))) {
          return;
        }
        const textField = form.getTextField(fieldName);
        const fieldValue = textField.getText();
        if (fieldValue) fieldData[fieldName] = fieldValue;
      });

      setFormData(fieldData);
    };

    if (inputBuffer) {
      loadFormData();
    }
  }, [inputBuffer]);

  return formData;
};
