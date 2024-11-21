import "./embla.css";
import { useEffect, useState } from "react";
import EmblaCarousel from "./EmblaCarousel";

import { db } from "../../../fireBaseConfig";
import { collection, getDocs } from "firebase/firestore";

import "./Home.css";

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let refCollectionCategories = collection(db, "categories");
    getDocs(refCollectionCategories).then((res) => {
      let categoriesList = res.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      });

      setCategories(categoriesList);
    });
  }, []);

  const OPTIONS = { dragFree: true, loop: true };
  // const SLIDE_COUNT = categories.length; //6
  // const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

  return (
    <div>
      {/* <p className="rambla-regular">ESTE ES EL HOME DE INDIA CUEROS</p> */}

      {/* <h1 className="rambla-regular">ADELANTOS INVIERNO H1</h1>
      <h2 className="rambla-regular">ADELANTOS INVIERNO H2</h2>
      <h3 className="rambla-regular"> ADELANTOS INVIERNO H3</h3> */}

      <EmblaCarousel options={OPTIONS} categories={categories} />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "40px",
        }}
      >
        <div className="texto">
          <h3 className="rambla-regular">
            ACA IRIA LA MISION, VISION Y ALGUNA COSA MAS
          </h3>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod
            repellendus, quas, voluptatum quidem, eaque quia quibusdam nemo
            voluptas aperiam quae iusto Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Quod repellendus, quas, voluptatum quidem, eaque
            quia quibusdam nemo voluptas aperiam quae iusto
          </p>

          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod
            repellendus, quas, voluptatum quidem, eaque quia quibusdam nemo
            voluptas aperiam quae iusto Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Quod repellendus, quas, voluptatum quidem, eaque
            quia quibusdam nemo voluptas aperiam quae iusto
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
