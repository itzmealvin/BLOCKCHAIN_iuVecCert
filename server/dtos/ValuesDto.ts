import { FileParamsDto } from "./FileParamsDto";

export default interface ValuesDto {
  values: string[];
  challenge?: FileParamsDto;
}
