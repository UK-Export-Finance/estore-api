export enum FolderStatusEnum {
  SENDING_TO_CUSTODIAN = 'Being sent to Custodian',
  SENT_TO_CUSTODIAN = 'Sent to Custodian',
  CUSTODIAN_JOB_NOT_READABLE_YET = 'Custodian is not returning job record yet',
  CUSTODIAN_JOB_NOT_STARTED = "Custodian has job record, but folder creation didn't start yet",
  CUSTODIAN_JOB_STARTED = 'Custodian started folder creation',
  CUSTODIAN_JOB_COMPLETED = 'Custodian completed folder creation',
  CUSTODIAN_JOB_FAILED = 'Custodian folder creation failed',
  EXISTS_IN_SHAREPOINT = 'Folder exists in Sharepoint',
}
