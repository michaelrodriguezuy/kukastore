import React from "react";

const Politicas = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "20px",
        textAlign: "center",
        padding: "60px",
      }}
    >
      {/* quiero cambiar y tener titulos en negrita */}

      <h1>Política de privacidad</h1>
      <p>
        {`En este sitio web, respetamos su información personal y en vista de cumplir con las políticas de seguridad respectivas concernientes a todo sitio web, que deberían ser obligatorias, informamos lo siguiente...`}
        <br />
        <br />
      </p>

      <h1>Privacidad de los datos personales</h1>
      <p>
        {`Sus datos personales le corresponden solo a usted y este sitio web es responsable de no revelar ninguna clase de información que le pertenezca (como email, telefono, etc.), salvo su expresa autorización o fuerzas de naturaleza mayor de tipo legal que lo involucren, como hackeos o suplantaciones.`}
        <br />
        <br />
      </p>

      <h1>Seguridad de su información personal</h1>
      <p>
        {`
Este sitio web se hace responsable de velar por su seguridad, por la privacidad de su información y por el respeto a sus datos, de acuerdo con las limitaciones que la actual Internet nos provee, siendo conscientes que no estamos excluídos de sufrir algún ataque por parte de crackers o usuarios malintencionados que ejerzan la delincuencia informática.`}
        <br />
        <br />
      </p>

      <h1>Obtención de su información</h1>
      <p>
        {`Todos sus datos personales consignados en este sitio son suministrados por usted mismo, haciendo uso entero de su libertad. La información aquí almacenada sólo comprende datos básicos ingresados mediante formularios de contacto, comentarios u otros similares.`}
        <br />
        <br />
      </p>

      <h1>Uso de la información</h1>
      <p>
        {`Al proporcionarnos sus datos personales, estando de acuerdo con la Política de Privacidad aquí consignada, nos autoriza para el siguiente uso de su información: a) para el fin mismo por lo cual se ha suministrado; b) para considerarlo dentro de nuestras estadísticas de tráfico; c) las informaciones atinentes a medios de pago consistentes en claves personales para las transacciones electrónicas, en este sitio no se mantiene ningún acceso directo ni indirecto ni conocimiento de claves personales ni de códigos, los que son dirigidos exclusivamente al proveedor del medio de pago, ya sea VISA, MASTERCARD, AMERICAN EXPRESS, u otro que se emplee a traves de Mercado Pago.`}
        <br />
        <br />
      </p>

      <h1>Modificaciones a nuestras Políticas de Privacidad</h1>
      <p>
        {`El sitio web se reserva el derecho de modificar, rectificar, alterar, agregar o eliminar cualquier punto del presente escrito en cualquier momento y sin previo aviso, siendo su responsabilidad el mantenerse informado del mismo para una adecuada administración de su información.`}

        {`Una vez realizada la compra se dará por entendida y validada la aceptación de los TÉRMINOS Y CONDICIONES expresadas en este sitio.`}
      </p>
    </div>
  );
};

export default Politicas;
