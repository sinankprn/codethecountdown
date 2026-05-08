import "./GradientMesh.css";

export function GradientMesh() {
  return (
    <div className="mesh" aria-hidden>
      <div className="mesh__blob mesh__blob--blue" />
      <div className="mesh__blob mesh__blob--purple" />
      <div className="mesh__blob mesh__blob--magenta" />
      <div className="mesh__blob mesh__blob--cyan" />
      <div className="mesh__grain" />
      <div className="mesh__dots" />
    </div>
  );
}
