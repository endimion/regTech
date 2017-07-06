/*
Copyright IBM Corp. 2016 All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (

	"fmt"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)


// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}


type CustomEvent struct{
	Message string
	Body    string
	TxId   string
}





func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	leiManager :=  LEIManager{FiManagers: make(map[string]*FIManager) }

	// testFiManager := FIManager{Id:"testId",Contracts:make(map[string]Actus)}
	// leiManager.FiManagers["test"] = testFiManager

	encodedLei,err  := json.Marshal(leiManager)
	err = stub.PutState("leiManager", []byte(encodedLei))
	if err != nil {
			return nil, err
	}
	return nil, nil
}


func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	if function == "addFIManager"{
		return t.AddFIManager(stub, args) //capital letters are required to expose the method from another file
	}
	if function == "addActus"{
		return t.AddActus(stub, args) //capital letters are required to expose the method from another file
	}

	if function == "update"{
		return t.Update(stub, args) //capital letters are required to expose the method from another file
	}

	return nil, nil
}


// Query callback representing the query of a chaincode
func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if function == "getFIManagers" {
		return t.GetFIManagers(stub,args)
	}

	if function == "getPending" {
		return t.GetPending(stub,args)
	}

	if function == "getReport" {
		return t.GetReport(stub,args)
	}


	return nil,nil
}



func SendSuccessEvent(stub shim.ChaincodeStubInterface, request string,
	message string)([]byte, error){
		event := CustomEvent{Message: message, Body: request, TxId : stub.GetTxID()}
		eventJSON,err := json.Marshal(event)
		if err != nil{
			SendErrorEvent(stub,"could not marshal event")
		}
		tosend := string(eventJSON)
		err = stub.SetEvent("evtsender", []byte(tosend))
		if err != nil {
			return nil, err
		}
		return nil, nil
	}


	//sends an errorEvent Message and returns the error
	func SendErrorEvent(stub shim.ChaincodeStubInterface, message string)([]byte, error){
		tosend := message + "." + stub.GetTxID()
		err := stub.SetEvent("evtsender", []byte(tosend))
		if err != nil {
			return nil, err
		}
		return nil, nil
	}





	func main() {
		err := shim.Start(new(SimpleChaincode))
		if err != nil {
			fmt.Printf("Error starting Simple chaincode: %s", err)
		}
	}
