import * as yup from "yup";

const optionalAadhar = yup
  .string()
  .transform((v) => (v == null ? "" : String(v).replace(/\D/g, "")))
  .test(
    "aadhar-len",
    "Aadhar must be exactly 12 digits if provided",
    (v) => !v || v.length === 12
  );

const optionalFields = {
  address: yup.string().optional(),
  aadhar_number: optionalAadhar,
  gender: yup.string().optional(),
  age: yup
    .mixed()
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v))
    .test(
      "age-num",
      "Age must be a valid number",
      (v) => v === undefined || (!Number.isNaN(Number(v)) && Number(v) >= 0)
    ),
  guardian: yup.string().optional(),
  guardian_phone: yup
    .string()
    .optional()
    .test(
      "phone-len",
      "Phone must be at least 10 digits if provided",
      (v) => !v || String(v).replace(/\D/g, "").length >= 10
    ),
};

/** New student: name, roll, class, email, password required; rest optional */
export const studentAddSchema = yup.object({
  name: yup.string().trim().min(2, "Name must be at least 2 characters").required("Name is required"),
  roll_number: yup.string().required("Roll Number is required"),
  student_class: yup.string().required("Select a class"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  ...optionalFields,
});

/** School update: same five fields required as add */
export const studentEditSchema = studentAddSchema;

/** @deprecated use studentAddSchema */
export const studentSchema = studentAddSchema;

/**
 * @param {Record<string, unknown>} values
 * @param {boolean} isEdit
 * @returns {Record<string, string>} Formik errors object
 */
export function getStudentValidationErrors(values, isEdit) {
  const schema = isEdit ? studentEditSchema : studentAddSchema;
  try {
    schema.validateSync(values, { abortEarly: false });
    return {};
  } catch (e) {
    if (e instanceof yup.ValidationError) {
      const errors = {};
      if (e.inner?.length) {
        for (const err of e.inner) {
          if (err.path && errors[err.path] == null) errors[err.path] = err.message;
        }
      } else if (e.path) {
        errors[e.path] = e.message;
      }
      return errors;
    }
    return { form: e?.message || "Validation failed" };
  }
}
