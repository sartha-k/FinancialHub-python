import { User } from "./user.model";
import { SavingsPlan } from "./savingsplan.model";

export interface PlanApplication{
    planApplicationId?:number;
    user?:User;
    savingsPlan?:SavingsPlan;
    appliedAmount:number;
    status:string;
    applicationDate:string;
    remarks:string;
    proofDocument:string;
    maturityAmount?:number;
    totalInterestEarned?:number;
    appliedRateOfInterest?:number;
    appliedTimeFrame?:number;
}
