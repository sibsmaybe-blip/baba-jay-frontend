import paintImg from "../assets/images/paint.jpg";

// A consistent header banner for every module page — the paint photo
// with a dark gradient overlay so white title text stays readable
// regardless of what part of the image sits behind it.
function PageBanner({ title, subtitle }) {
  return (
    <div
      className="position-relative rounded overflow-hidden mb-4"
      style={{ height: "140px" }}
    >
      <img
        src={paintImg}
        alt=""
        className="w-100 h-100"
        style={{ objectFit: "cover", position: "absolute", inset: 0 }}
      />
      <div
        className="position-absolute"
        style={{
          inset: 0,
          background: "linear-gradient(90deg, rgba(74,32,54,0.90) 20%, rgba(199,63,104,0.45) 100%)",
        }}
      />
      <div className="position-absolute d-flex flex-column justify-content-center h-100 ps-4" style={{ color: "white" }}>
        <h2 className="mb-0" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        {subtitle && (
          <p className="mb-0 small" style={{ color: "rgba(255,255,255,0.75)" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default PageBanner;
