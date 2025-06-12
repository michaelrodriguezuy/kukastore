import React, { useCallback, useEffect, useRef, useContext } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons, PrevButton, NextButton } from "./EmblaCarouselArrowButtons";
import { DotButton, useDotButton } from "./EmblaCarouselDotButton";
import { Link } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import "../../../styles/components/carousel/embla.css";

const TWEEN_FACTOR_BASE = 0.2;

const EmblaCarousel = (props) => {
  const { options, destacados } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const { addToCart } = useContext(CartContext);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef([]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    console.log("Productos destacados:", destacados); // Para debug
  }, [destacados]);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {destacados && destacados.length > 0 ? (
            destacados.map((producto, index) => (
              <div className="embla__slide" key={index}>
                <div className="embla__slide__inner">
                  <div className="embla__slide__img-container">
                    <img
                      className="embla__slide__img"
                      src={producto.image}
                      alt={producto.title}
                    />
                  </div>
                  <div className="embla__slide__content">
                    <div className="embla__slide__text">
                      <span>{producto.category || 'Destacado'}</span>
                      <h2>{producto.title}</h2>
                      <p>
                        {truncateText(
                          producto.description || 
                          'No hay descripción disponible para este producto.',
                          100
                        )}
                      </p>
                      <div className="embla__slide__buttons">
                        <Link 
                          to={`/itemDetail/${producto.id}`} 
                          className="embla__slide__button"
                        >
                          COMPRAR AHORA
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="embla__slide">
              <div className="embla__slide__inner">
                <p>No hay productos destacados disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {destacados && destacados.length > 1 && (
        <>
          <div className="embla__dots">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`embla__dot ${index === selectedIndex ? 'embla__dot--selected' : ''}`}
                onClick={() => onDotButtonClick(index)}
              />
            ))}
          </div>
          <div className="embla__controls">
            <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
            <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
          </div>
        </>
      )}
    </div>
  );
};

export default EmblaCarousel;
