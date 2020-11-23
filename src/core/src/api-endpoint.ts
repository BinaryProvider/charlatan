import { Mocker } from 'mocker-data-generator';

export class ApiEndpoint extends Mocker {
  public name: string;
  public definition: any;
  public index = Number.MAX_VALUE;
  public count = 10;
  public routes: any;

  private static instance: ApiEndpoint;

  public static get schema(): ApiEndpoint {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}