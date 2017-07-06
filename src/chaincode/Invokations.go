package main

import (
  "encoding/json"
  "github.com/hyperledger/fabric/core/chaincode/shim"
  "fmt"
)


/**
takes as from the certificate, the ID of the logged in user (attribute userId)
and creates a new FIManager and adds it to the LEIManager of the system
**/
func (t *SimpleChaincode) AddFIManager(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  if len(args) != 0 {
    return SendErrorEvent(stub,  "Incorrect number of arguments. Expecting 0"  )
  }
  userId, err := stub.ReadCertAttribute("userId")
  if err != nil {
    return SendErrorEvent(stub,  "Could not get userId attribute from Certificate")
  }

  fmt.Println("\n%s",string(userId))

  fiManager := FIManager{Id: string(userId), Contracts: make(map[string]*Actus)}
  leiBytes, err := stub.GetState("leiManager")
  if err != nil {
    return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
  }
  //get the supplements from the assets
  leiManager := LEIManager{}
  json.Unmarshal([]byte(leiBytes), &leiManager)
  leiManager.AddFIManager(&fiManager)

  encodedLei,err  := json.Marshal(leiManager)
  if err != nil {
    return SendErrorEvent(stub,"Could not Marshal LeiManager")
  }
  err = stub.PutState("leiManager", []byte(encodedLei))
  if err != nil{
    SendErrorEvent(stub,"could not put leiManager in state")
  }

  message := "Added FIManager for "+string(userId)+ " !"
  SendSuccessEvent(stub,message,"Tx chaincode finished OK.")

  return nil, nil
}


/**
    Adds the given Actus contract, passed as a JSON string,
    to the FIManager of the logged in user
**/
func (t *SimpleChaincode) AddActus(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  if len(args) != 1 {
    return SendErrorEvent(stub,  "Incorrect number of arguments. Expecting 1")
  }
  // actusString := args[0]
  actus := Actus{}
  json.Unmarshal([]byte(args[0]), &actus)
  userId, err := stub.ReadCertAttribute("userId")
  if err != nil {
    return SendErrorEvent(stub,  "Could not get userId attribute from Certificate")
  }else{
    leiBytes, err := stub.GetState("leiManager")
    if err != nil {
      return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
    }
    //get the supplements from the assets
    leiManager := LEIManager{}
    json.Unmarshal([]byte(leiBytes), &leiManager)
    fiManager, ok := leiManager.FiManagers[string(userId)];
  	if ok {
  		fiManager.AddContract(&actus)
      encodedLei,err  := json.Marshal(leiManager)
      err = stub.PutState("leiManager", []byte(encodedLei))
      if err != nil{
        SendErrorEvent(stub,"could not put leiManager in state")
      }
      message := "Actus contract Added ok "+string(userId)+ " !"
      SendSuccessEvent(stub,message,"Tx chaincode finished OK.")
  	}
  }
  return nil, nil
}



func (t *SimpleChaincode) Update(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
  if len(args) != 0 {
    return SendErrorEvent(stub,  "Incorrect number of arguments. Expecting 0")
  }
  leiBytes, err := stub.GetState("leiManager")
  if err != nil {
    return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
  }
  leiManager := LEIManager{}
  json.Unmarshal([]byte(leiBytes), &leiManager)

  err = leiManager.Update()
  if err != nil {
      return SendErrorEvent(stub,"Failed to update")
  }
  encodedLei,err  := json.Marshal(leiManager)
  err = stub.PutState("leiManager", []byte(encodedLei))
  if err != nil{
    SendErrorEvent(stub,"could not put leiManager in state")
  }
  message := "updating all pending contracts of FiManagers finished ok!"
  SendSuccessEvent(stub,message,"Tx chaincode finished OK.")

  return nil, nil

}
