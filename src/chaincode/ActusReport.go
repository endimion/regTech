package main


type ContractReport struct{
  C1 C1
  C2 C2
  C3 C3
  C4 C4
  C5 C5
}

type C1 struct{
  UniqueTransactionIdentifier string
  UnderlyingInformation string
  ReportingDateAndTime string
}

type C2 struct{
  ReportingPartyLedgerAddress string
  ContractPartyLedgerAddress string
  ReportingEntityID string
  ContractPartyID string
}


type C3 struct{
  ContractType string
  ReportingPartyContractRole string
  ParticipatingPartyContractRole  string
  DealDate string
  EffectiveStartOfDate string
  MaturityDate string
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
}

type C4 struct{
  DynamicNominalInterestDate string
  Validated bool
}

type C5 struct{
  DTDIdentifier string
  States States
}


func (report *ContractReport) buildReportFromActus(actus *Actus) *ContractReport{
  report.C1.UniqueTransactionIdentifier = actus.UniqueTransactionIdentifier
  report.C1.UnderlyingInformation = actus.UnderlyingInformation
  report.C1.ReportingDateAndTime = actus.ReportingDateAndTime

  report.C2.ReportingPartyLedgerAddress = actus.ReportingPartyLedgerAddress
  report.C2.ReportingEntityID = actus.ReportingEntityID
  report.C2.ContractPartyID = actus.ContractPartyID


  report.C3.ContractType= actus.ContractType
  report.C3.ReportingPartyContractRole = actus.ReportingPartyContractRole
  report.C3.ParticipatingPartyContractRole= actus.ParticipatingPartyContractRole
  report.C3.DealDate = actus.DealDate
  report.C3.EffectiveStartOfDate = report.C3.EffectiveStartOfDate
  report.C3.MaturityDate = actus.MaturityDate
  report.C3.CADateOfInterestPayment= actus.CADateOfInterestPayment
  report.C3.NotionalPrincipal = actus.NotionalPrincipal
  report.C3.CycleOfInterestPayment = actus.CycleOfInterestPayment
  report.C3.NominalInterestRate = actus.NominalInterestRate
  report.C3.Currency = actus.Currency
  report.C3.StatusDate = actus.StatusDate
  report.C3.InitialExchangeDate = actus.InitialExchangeDate
  report.C3.PremiunDiscountAtIED = actus.PremiunDiscountAtIED
  report.C3.OptionExcerciseEndDate = actus.OptionExcerciseEndDate
  report.C3.DayCountConvention = actus.DayCountConvention
  report.C3.AnchorDateOfRateReset = actus.AnchorDateOfRateReset
  report.C3.CycleOfRateReset = actus.CycleOfRateReset
  report.C3.RateSpread = actus.RateSpread
  report.C3.MarketObjectCodeRateReset = actus.MarketObjectCodeRateReset
  report.C3.LegalEntityIDCounterparty = actus.LegalEntityIDCounterparty
  report.C3.LegalEntity = actus.LegalEntity

  report.C4.DynamicNominalInterestDate = actus.DynamicNominalInterestDate
  report.C4.Validated = actus.Validated

  report.C5.DTDIdentifier = actus.DTDIdentifier
  report.C5.States = actus.States


  return report
}
