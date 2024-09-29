export interface IObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ResponseData {
  success: boolean;
  message: string;
  data?: IObject;
}

export interface Response extends IObject {
  data: ResponseData;
}



