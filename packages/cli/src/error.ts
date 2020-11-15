const tsEngineErrorType = "TS_ENGINE_ERROR";

export class TsEngineError extends Error {
  type: string = tsEngineErrorType;

  constructor(message: string) {
    super(message);
  }
}

export const isTsEngineError = (error: Error) => {
  return (error as TsEngineError)?.type === tsEngineErrorType;
};
