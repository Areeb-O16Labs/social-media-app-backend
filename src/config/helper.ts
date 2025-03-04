import { UnprocessableEntityException } from "@nestjs/common";
import { hash, genSalt, compare } from "bcrypt";

export const customResponseHandler = async (data: any, message: string) => {
  return { data: data, message: message };
};

export const hashPassword = async (attemptPass: string) => {
  const salt = await genSalt(10);
  const password = await hash(attemptPass, salt);
  return password;
};

export const checkPassword = async (attemptPass: string, password: string) => {  
  const match = await compare(attemptPass, password);  
  if (!match) throw new UnprocessableEntityException('Invalid credentials!');
  return match;
};