export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static notFound(message: string) {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static badRequest(message: string) {
    return new ApiError(400, 'BAD_REQUEST', message);
  }

  static internal(message: string) {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
