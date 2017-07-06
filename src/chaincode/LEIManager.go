package main

/************** LEI Manager *******************************/
type LEIManager struct{
	FiManagers map[string]*FIManager // slice of FIManager ids
}
func (l LEIManager) GetFIManagers() map[string]*FIManager {
	return l.FiManagers
}
func (l *LEIManager) AddFIManager(manager *FIManager) {
		_, ok := l.FiManagers[manager.Id];
		if !ok {
			l.FiManagers[manager.Id] = manager
		}
}
func (l *LEIManager) RemoveFIManager(managerId string) {
	_, ok := l.FiManagers[managerId];
	if ok {
		delete(l.FiManagers, managerId);
	}
}

func (l *LEIManager) Update() error{
	for _, fim := range l.FiManagers {
		err := fim.Update()
		if err != nil {
			return err
		}
	}
	return nil
}
