class VerifyPDFError extends Error {
  static TYPES = {
    TYPE_UNKNOWN: "TYPE_UNKNOWN",
    TYPE_INPUT: "TYPE_INPUT",
    TYPE_PARSE: "TYPE_PARSE",
    TYPE_BYTE_RANGE: "TYPE_BYTE_RANGE",
    VERIFY_SIGNATURE: "VERIFY_SIGNATURE",
    UNSUPPORTED_SUBFILTER: "UNSUPPORTED_SUBFILTER",
  };
  static TYPE_PARSE;
  type;

  constructor(msg, type = VerifyPDFError.TYPES.TYPE_UNKNOWN) {
    super(msg);
    this.type = type;
  }
}

export default VerifyPDFError;
