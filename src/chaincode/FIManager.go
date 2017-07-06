package main


/********************** FIManager *****************************/
type FIManager struct{
	Id string
	Contracts  map[string]*Actus
}
func (fim FIManager) GetPending() []*Actus {
	pendingContracts := make([]*Actus,0)
	for _, contract := range fim.Contracts {
		if ! contract.Validated{
			pendingContracts = append(pendingContracts,contract)
		}
	}
	return pendingContracts
}

func (fim *FIManager) AddContract(contract *Actus) {
		_, ok := fim.Contracts[contract.Id];
		if !ok {
			fim.Contracts[contract.Id] = contract
		}
}

/* can only remove contracts that have not been validated */
func (fim *FIManager) RemoveContract(contractId string) {
	_, ok := fim.Contracts[contractId];
	if ok  && ! fim.Contracts[contractId].Validated{
		delete(fim.Contracts, contractId);
	}
}


func (fim *FIManager) Update()  error{
	for _, contract := range fim.Contracts {
		if ! contract.Validated{
			err := contract.UpdateFromAPI()
			if err != nil {
				return err
			}
		}
	}
	return nil
}
