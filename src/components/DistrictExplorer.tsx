import React, { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { LESOTHO_DISTRICTS, getLocalizedArticle } from "../data/articles";
import type { Article, Language } from "../types";

interface DistrictExplorerProps {
  language: Language;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

const SCHEMATIC_POSITIONS: Record<string, { x: number; y: number }> = {
  "Butha-Buthe": { x: 185, y: 42 },
  Leribe: { x: 148, y: 74 },
  Mokhotlong: { x: 256, y: 82 },
  Berea: { x: 112, y: 112 },
  Maseru: { x: 96, y: 152 },
  "Thaba-Tseka": { x: 196, y: 146 },
  Mafeteng: { x: 64, y: 198 },
  "Mohale's Hoek": { x: 104, y: 234 },
  "Qacha's Nek": { x: 214, y: 214 },
  Quthing: { x: 152, y: 262 },
};

export const DistrictExplorer: React.FC<DistrictExplorerProps> = ({
  language,
  articles,
  onSelectArticle,
}) => {
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>("Maseru");

  const activeDistrict = useMemo(
    () =>
      LESOTHO_DISTRICTS.find((d) => d.name === selectedDistrictName) ||
      LESOTHO_DISTRICTS[3],
    [selectedDistrictName]
  );

  const matchingArticles = useMemo(() => {
    const published = articles.filter((a) => !a.status || a.status === "published");
    return published
      .filter(
        (a) =>
          a.district === activeDistrict.name ||
          a.district === "All districts" ||
          (!a.district && activeDistrict.name === "Maseru")
      )
      .slice(0, 4);
  }, [articles, activeDistrict.name]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-7 flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#1c5d91]">
            {language === "st" ? "Litereke tse 10 tsa Lesotho" : "All 10 Districts of Lesotho"}
          </p>
          <h3 className="text-xl font-bold text-[#112a46] mt-1">
            {language === "st" ? "Batla litaba ho ea ka setereke" : "District information explorer"}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          {language === "st"
            ? "Khetha setereke ka tlase"
            : "Illustrative district directory"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Schematic District Selector Diagram */}
        <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-[#f5f8fb] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
            <span className="font-semibold text-[#112a46]">
              {language === "st" ? "Khetho ea setereke" : "District schematic"}
            </span>
            <span>10 / 10</span>
          </div>

          <svg
            viewBox="0 0 320 300"
            className="w-full h-56 select-none"
            role="img"
            aria-label="Illustrative schematic of Lesotho's 10 districts"
          >
            {/* Stylized Lesotho silhouette polygon */}
            <path
              d="M175 18 L225 28 L278 65 L286 115 L254 165 L245 215 L212 248 L168 282 L120 270 L78 242 L42 204 L58 158 L82 118 L120 75 Z"
              fill="#eaf4fb"
              stroke="#b8cde0"
              strokeWidth="2"
            />
            {/* Zone guide lines */}
            <path
              d="M136 52 Q162 125 148 238"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.2"
              strokeDasharray="4 4"
            />

            {LESOTHO_DISTRICTS.map((district) => {
              const pos = SCHEMATIC_POSITIONS[district.name] || { x: 160, y: 150 };
              const isActive = district.name === activeDistrict.name;
              return (
                <g
                  key={district.name}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedDistrictName(district.name)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${district.name} district`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDistrictName(district.name);
                    }
                  }}
                >
                  {isActive && (
                    <circle r="13" fill="#1c5d91" fillOpacity="0.16" />
                  )}
                  <circle
                    r={isActive ? 6.5 : 4.5}
                    fill={isActive ? "#1c5d91" : "#ffffff"}
                    stroke={isActive ? "#112a46" : "#1c5d91"}
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y={district.name === "Butha-Buthe" ? -10 : 15}
                    textAnchor="middle"
                    fontSize={isActive ? "10.5" : "9"}
                    fontWeight={isActive ? "700" : "600"}
                    fill={isActive ? "#112a46" : "#475569"}
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    {district.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <p className="text-[11px] text-slate-500 mt-2">
            {language === "st"
              ? "Setšoantšo sena ke sa tataiso ea litereke feela, eseng 'mapa oa sebaka."
              : "Schematic selector only — not a scaled geographic map."}
          </p>
        </div>

        {/* District selector buttons + details */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Select Lesotho district">
            {LESOTHO_DISTRICTS.map((district) => {
              const isActive = district.name === activeDistrict.name;
              return (
                <button
                  key={district.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedDistrictName(district.name)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-[#112a46] text-white border-[#112a46]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {district.name}
                </button>
              );
            })}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1c5d91] shrink-0" />
                <h4 className="text-base font-bold text-[#112a46]">{activeDistrict.name}</h4>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{activeDistrict.town}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-slate-700">{activeDistrict.zone}</span>
              </div>
            </div>

            <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed">
              {language === "st" ? activeDistrict.sesothoSummary : activeDistrict.focusSummary}
            </p>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {language === "st"
                  ? `Litaba tse amehang (${matchingArticles.length})`
                  : `Relevant records & updates (${matchingArticles.length})`}
              </p>

              {matchingArticles.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {language === "st"
                    ? "Ha ho litaba tse khethehileng tsa setereke sena hajoale."
                    : "No district-specific notices matched yet."}
                </p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {matchingArticles.map((article) => {
                    const localized = getLocalizedArticle(article, language);
                    return (
                      <li key={article.id} className="py-2 first:pt-0 last:pb-0">
                        <button
                          type="button"
                          onClick={() => onSelectArticle(article)}
                          className="w-full text-left group flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 group-hover:text-[#1c5d91] truncate">
                              {localized.title}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {article.category} · {article.district || "National"} ·{" "}
                              <span className="tabular-nums">{article.date}</span>
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1c5d91] shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
