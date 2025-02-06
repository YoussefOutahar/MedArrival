import { BaseDTO } from "./BaseDTO";

export interface ClientDTO extends BaseDTO {
    name: string;
    address: string;
    clientType: ClientType;
}

export enum ClientType {
    CLIENT_RP = 'CLIENT_RP',
    CLIENT_MARCHER = 'CLIENT_MARCHER'
  }