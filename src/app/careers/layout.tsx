import "./careers.css";
import UtmKeeper from "./UtmKeeper";

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <div className="cr"><UtmKeeper />{children}</div>;
}
