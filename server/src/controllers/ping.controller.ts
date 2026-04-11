import { Controller, Get, Route } from 'tsoa';

interface PingResponse {
  message: string;
  time: Date;
}

@Route('ping')
export class PingController extends Controller {
  @Get('/')
  public async getMessage(): Promise<PingResponse> {
    return {
      message: 'pong',
      time: new Date(),
    };
  }
}
