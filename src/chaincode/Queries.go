package main

import(
  "errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
  "encoding/json"
)


type PendingContracts struct{
  FiManager string
  Pending []*Actus
}



func (t *SimpleChaincode) GetFIManagers(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
		if len(args) != 0 {
			return nil, errors.New("Incorrect number of arguments. Expecting 0")
		}
    leiBytes, err := stub.GetState("leiManager")
    if err != nil {
      return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
    }
    //get the supplements from the assets
    leiManager := LEIManager{}
    json.Unmarshal([]byte(leiBytes), &leiManager)

    encodedRes,_ := json.Marshal(leiManager.FiManagers)
    // encodedRes,_ := json.Marshal(leiManager)
    return []byte(encodedRes), nil
}


func (t *SimpleChaincode) GetPending(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
		if len(args) != 0 {
			return nil, errors.New("Incorrect number of arguments. Expecting 0")
		}
    leiBytes, err := stub.GetState("leiManager")
    if err != nil {
      return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
    }
    leiManager := LEIManager{}
    json.Unmarshal([]byte(leiBytes), &leiManager)

    allPendingContracts := make([]PendingContracts,0)
    for _,fiManager := range leiManager.FiManagers{
      allPendingContracts = append(allPendingContracts,PendingContracts{FiManager: fiManager.Id,
                                                                Pending: fiManager.GetPending()})
    }

    encodedRes,_ := json.Marshal(allPendingContracts)
    return []byte(encodedRes), nil
}


func (t *SimpleChaincode) GetReport(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
		if len(args) != 2 {
			return nil, errors.New("Incorrect number of arguments. Expecting 2")
		}

    fiManagerId := args[0]
    actusId := args[1]


    leiBytes, err := stub.GetState("leiManager")
    if err != nil {
      return SendErrorEvent(stub,"Failed to get state for key \"leiManager\"")
    }
    leiManager := LEIManager{}
    json.Unmarshal([]byte(leiBytes), &leiManager)

    fiManager := leiManager.FiManagers[fiManagerId]
    actus := fiManager.Contracts[actusId]

    report := &ContractReport{}
    report.buildReportFromActus(actus)

    encodedRes,_ := json.Marshal(report)
    return []byte(encodedRes), nil
}
