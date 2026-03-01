export interface FormFieldMinReq {
  name: string,
  placeholder?: string,
  required?: boolean,
  value?: string|number
}

export interface FormField extends FormFieldMinReq {
  id: string
  label?: string
}