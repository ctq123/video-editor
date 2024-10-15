/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IObject {
  [key: string]: any;
}

export interface ResponseData {
  success: boolean;
  message: string;
  data?: any;
}

export interface Response extends IObject {
  data: ResponseData;
}

export interface VideoData {
  videoUrl: string;
  fileName: string;
  totalDuration: number;
}



