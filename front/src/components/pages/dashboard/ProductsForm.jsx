import { Button, LinearProgress, MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { db, uploadFile } from "../../../fireBaseConfig";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ProductsForm = ({
  handleClose,
  setIsChange,
  productSelected,
  setProductSelected,
  categories,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [files, setFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  const [codeExistsWarning, setCodeExistsWarning] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    const filesArray = Array.from(selectedFiles);
    setFiles(filesArray);
  };

  const handleImage = async () => {
    console.log("cargando imagenes");
    setIsLoading(true);

    try {
      const urls = await Promise.all(
        Array.from(files).map(async (file) => {
          console.log("cargando imagen dentro del array");
          const url = await uploadFile(file, (progress) => {
            setUploadProgress(progress);
          });
          console.log("url cargada", url);
          return url;
        })
      );

      setImageUrls((prevUrls) => [...prevUrls, ...urls]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setIsLoading(false);
    }
  };

  const checkCodeExists = async (value) => {
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("code", "==", value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const validationSchema = Yup.object().shape({
    code: Yup.string()
      .transform((value) => value.replace(/\s+/g, ""))
      .required("El código es obligatorio"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    const productsCollection = collection(db, "products");
    const newValues = {
      ...values,
      unit_price: +values.unit_price,
      stock: +values.stock,
      image: imageUrls,
    };

    console.log("Valores a enviar:", newValues);

    try {
      if (productSelected) {
        const obj = { ...productSelected, ...newValues };
        await updateDoc(doc(productsCollection, productSelected.id), obj);
      } else {
        await addDoc(productsCollection, newValues);
      }
      console.log("Artículo guardado correctamente");
      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error al guardar el artículo:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Formik
        initialValues={{
          code: productSelected?.code || "",
          title: productSelected?.title || "",
          description: productSelected?.description || "",
          unit_price: productSelected?.unit_price || "",
          stock: productSelected?.stock || "",
          color: productSelected?.color || "",
          category: productSelected?.category || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
            onChange={async (e) => {
              if (e.target.name === "code") {
                const codeExists = await checkCodeExists(e.target.value);
                setCodeExistsWarning(codeExists);
              }
            }}
          >
            <Field
              as={TextField}
              variant="outlined"
              label="Código"
              name="code"
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, "");
                setFieldValue("code", value);
              }}
              value={values.code}
              helperText={
                codeExistsWarning ? (
                  "El código ya existe"
                ) : (
                  <ErrorMessage name="code" />
                )
              }
              error={!!(<ErrorMessage name="code" />) || codeExistsWarning}
            />

            <Field
              as={TextField}
              variant="outlined"
              label="Título"
              name="title"
              value={values.title}
              onChange={(e) => setFieldValue("title", e.target.value)}
            />
            <Field
              as={TextField}
              variant="outlined"
              label="Descripción"
              name="description"
              value={values.description}
              onChange={(e) => setFieldValue("description", e.target.value)}
            />
            <Field
              as={TextField}
              variant="outlined"
              label="Precio"
              name="unit_price"
              type="number"
              value={values.unit_price}
              onChange={(e) => setFieldValue("unit_price", e.target.value)}
            />
            <Field
              as={TextField}
              variant="outlined"
              label="Stock"
              name="stock"
              type="number"
              value={values.stock}
              onChange={(e) => setFieldValue("stock", e.target.value)}
            />
            <Field
              as={TextField}
              variant="outlined"
              label="Color"
              name="color"
              value={values.color}
              onChange={(e) => setFieldValue("color", e.target.value)}
            />
            <Field
              as={TextField}
              variant="outlined"
              label="Categoría"
              name="category"
              select
              value={values.category}
              onChange={(e) => setFieldValue("category", e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Field>

            <TextField type="file" onChange={handleFileChange} multiple />
            {files.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    onClick={handleImage}
                    type="button"
                    disabled={isLoading}
                  >
                    Cargar imágenes
                  </Button>
                </div>
                <div>
                  {isLoading && (
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ marginBottom: "10px" }}
                    />
                  )}
                </div>
              </div>
            )}

            {files.length > 0 && !isLoading && uploadProgress === 100 && (
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                style={{ display: "flex", justifyContent: "center" }}
              >
                {productSelected ? "Modificar" : "Crear"}
              </Button>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProductsForm;
