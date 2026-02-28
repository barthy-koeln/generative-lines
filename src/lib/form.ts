export interface FormFieldMinReq {
  label: string,
  name: string,
  placeholder?: string,
  required?: boolean
}

export interface FormField extends FormFieldMinReq {
  id: string,
  value: string|number
}