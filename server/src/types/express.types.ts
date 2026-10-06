import { Request } from "express";
import { AccessTokenPayload } from "./auth.types";
import { CreateUserBody, UpdateUser } from "./user.types";

export interface RequestWithAccessToken extends Request {
  userDecoded?: AccessTokenPayload;
}

export interface CreateUserRequest extends RequestWithAccessToken {
  body: CreateUserBody;
}

export interface UpdateUserRequest extends RequestWithAccessToken {
  body: UpdateUser;
}