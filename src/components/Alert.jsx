// Wraps Bootstrap's alert classes with an icon, matching the textured
// styling in theme.css. Use this instead of a raw <div className="alert...">
// so every alert in the app looks and behaves the same way.
const ICONS = {
  danger: "bi-exclamation-triangle-fill",
  warning: "bi-exclamation-circle-fill",
  info: "bi-info-circle-fill",
};

function Alert({ type = "info", children }) {
  return (
    <div className={`alert alert-${type}`}>
      <i className={`bi ${ICONS[type]} alert-icon`}></i>
      {children}
    </div>
  );
}

export default Alert;
