import { User } from "./user.model";

export interface Enquiry{
    enquiryId?:number;
    message:string;
    user?:User;
    answer:string;
}