import { Response } from 'express';

export class ResponseHandler {
  /**
   * Send a success response
   * @param res Express Response object
   * @param statusCode HTTP Status Code
   * @param message Success message
   * @param data Optional payload (DTO)
   */
  public static success(res: Response, statusCode: number, message: string, data?: any) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data !== undefined && { data })
    });
  }

  /**
   * Send an error response
   * @param res Express Response object
   * @param statusCode HTTP Status Code
   * @param error Error message
   */
  public static error(res: Response, statusCode: number, error: string) {
    return res.status(statusCode).json({
      success: false,
      error
    });
  }
}
