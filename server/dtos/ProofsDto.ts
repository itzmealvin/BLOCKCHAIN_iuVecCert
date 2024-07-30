import FileParamsDto from "./FileParamsDto";

export default interface ProofsDto {
  coeffs: string[];
  commit: string[];
  files: FileParamsDto[];
}
