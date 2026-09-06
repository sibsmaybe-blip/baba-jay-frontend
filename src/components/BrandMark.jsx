// A custom-built paint drop + brush stroke mark — the brand icon.
// Built as SVG (not a photo) so it's crisp at any size and can't
// break as a dead image link.
function BrandMark({ size = 32, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paint drop */}
      <path
        d="M50 8 C50 8 22 42 22 62 C22 78.5 34.5 90 50 90 C65.5 90 78 78.5 78 62 C78 42 50 8 50 8 Z"
        stroke={color}
        strokeWidth="6"
        fill="none"
      />
      {/* Brush stroke swoosh across the drop */}
      <path
        d="M30 58 C40 66, 60 66, 70 58"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default BrandMark;
