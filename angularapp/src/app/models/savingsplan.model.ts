export interface SavingsPlan{
   savingsPlanId?:number;
   name:string;
   rateOfInterest:number;
   timeFrame:number;
   riskLevel:'Low'|'Medium'|'High'
   description:string;
   status:string;
}
