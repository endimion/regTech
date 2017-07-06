package main

import (
	"fmt"
	"encoding/xml"
	"time"
	"net/http"
	"io/ioutil"

)


/* ACTUS CONTRACTS */
type Actus struct{
	Id string `xml:"ID"`
	Validated bool
	State int
	Particiapant string
	ParticipatingPartyContractRole string

	UniqueTransactionIdentifier string
	UnderlyingInformation string
	ReportingDateAndTime string
	ReportingPartyLedgerAddress string
	ContractPartyLedgerAddress string
	ReportingEntityID string
	ContractPartyID string
	ContractType string
	ReportingPartyContractRole string

	DealDate string
	EffectiveStartOfDate string
	MakeaturityDate string
	CADateOfInterestPayment string
	NotionalPrincipal string
	CycleOfInterestPayment string
	NominalInterestRate string
	Currency string
	StatusDate string
	InitialExchangeDate string
	PremiunDiscountAtIED string
	OptionExcerciseEndDate string
	DayCountConvention string
	AnchorDateOfRateReset string
	CycleOfRateReset string
	RateSpread string
	MarketObjectCodeRateReset string
	LegalEntityIDCounterparty string
	LegalEntity string
	DynamicNominalInterestDate string
	MaturityDate string

	DTDIdentifier string
	States States
}



type States struct{
	StateList []*State `xml:"State"`
}

type State struct{
	StateID string
	StateReport []*Event `xml:"Event"`
}



type Event struct {
	RelatedEvent string
	EventCode string
	DateOfOccurance string // day/month/year, e.g. "10/15/2017"
	AffectedVariables string
	ListofVariables string
	Values string
}



/*
validate(string tParticipatingPartyContractRole),
if the sender of the transaction is equal to particiapant
(a value provided at the creation of the contract)  then the value of the
participatingPartyContractRole = tParticipatingPartyContractRole and additionally validated = true;
*/

func (actus *Actus) Validate(tParticipatingPartyContractRole string, txSenderId string) {
	if txSenderId == actus.Particiapant{
		actus.ParticipatingPartyContractRole = tParticipatingPartyContractRole
 		actus.Validated = true
	}
}



func (actus Actus) GetReport() []byte {
	 encodedActus,_ := xml.Marshal(actus)
	 fmt.Println(string([]byte(encodedActus)))
	 return encodedActus
}

//pending(string LEI), takes as input the ID of the LEI MANAGER. If the given ide is * then this function returns true. Else it returns !validated && stringsEqual(LEI, contractPartyID)
func (actus Actus) Pending(lei string) bool{
	if lei == "*"{
		return true
	}else{
		return !actus.Validated && lei == actus.ContractPartyID
	}
}




func (actus *Actus) Update(day string, month string, year string){
		const timeFormat = "01/02/2006" //, "10/15/2017"
		updateTime,err := time.Parse(timeFormat,  month+"/"+day+"/"+year)
		fmt.Printf("will update")

		if err == nil{
			fmt.Printf(updateTime.String())
			Loop:
				for stateIndx,state := range actus.States.StateList{
					for _,ev := range state.StateReport{
						//ev.DateOfOccurance.Year() == year && ev.DateOfOccurance.Month() == month && ev.DateOfOccurance.Day() < day
						// fmt.Printf("\n COMPARING")
						// fmt.Printf("\n%b",ev.DateOfOccurance.After(updateTime))
						eventTime,_ := time.Parse(timeFormat, ev.DateOfOccurance)
						if eventTime.After(updateTime){
								fmt.Printf("\n new State %n ",stateIndx)
								actus.State = stateIndx +1
								break Loop
						}
					}
				}
		}else{
			fmt.Printf("error: %v\n", err)
		}
}


func (actus *Actus) UpdateFromAPI() error{

		const timeFormat = "01/02/2006" //, "10/15/2017"
		apiResponse, err := http.Get("http://localhost:8000/time")


		if err != nil {
      fmt.Printf("error: %v\n", err)
			return err
    } else {
        defer apiResponse.Body.Close() //after the method returns close the response object

				if apiResponse.StatusCode == 200 { // OK
				    bodyBytes, _ := ioutil.ReadAll(apiResponse.Body)
				    apiTime := string(bodyBytes)
						updateTime,err := time.Parse(timeFormat, apiTime)
						fmt.Printf("will update")

						if err == nil{
							Loop:
								for stateIndx,state := range actus.States.StateList{
									for _,ev := range state.StateReport{
										//ev.DateOfOccurance.Year() == year && ev.DateOfOccurance.Month() == month && ev.DateOfOccurance.Day() < day
										// fmt.Printf("\n COMPARING")
										// fmt.Printf("\n%b",ev.DateOfOccurance.After(updateTime))
										eventTime,_ := time.Parse(timeFormat, ev.DateOfOccurance)
										if eventTime.After(updateTime){
												fmt.Printf("\n new State %n ",stateIndx)
												actus.State = stateIndx +1
												break Loop
										}
									}
								}
						}else{
							fmt.Printf("error: %v\n", err)
							return err
						}
			}
    }
		return nil
}
