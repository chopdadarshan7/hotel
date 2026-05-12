import { useMemo, useState } from "react";
import { galleryCategoryOptions } from "../lib/siteData";

export default function GalleryGrid({ items, loading = false }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return items;
    }

    return items.filter((item) => item.category === activeFilter);
  }, [activeFilter, items]);

  const selectedItem = filteredItems[selectedIndex];

  return (
    <>
      <div className="filter-row">
        {galleryCategoryOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={activeFilter === option.value ? "filter-chip filter-chip--active" : "filter-chip"}
            onClick={() => {
              setActiveFilter(option.value);
              setSelectedIndex(-1);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {(loading ? Array.from({ length: 6 }) : filteredItems).map((item, index) =>
          loading ? (
            <div key={`gallery-skeleton-${index}`} className="gallery-tile gallery-tile--skeleton shimmer" />
          ) : (
            <button
              key={item.id}
              type="button"
              className="gallery-tile reveal"
              onClick={() => setSelectedIndex(index)}
            >
              <img src={item.url} alt={item.caption || "Gallery preview"} />
              <span>{item.caption}</span>
            </button>
          ),
        )}
      </div>

      {selectedItem ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedIndex(-1)}>
          <div className="lightbox" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedIndex(-1)} aria-label="Close gallery image">
              x
            </button>
            <img src={selectedItem.url} alt={selectedItem.caption || "Gallery"} />
            <div className="lightbox__footer">
              <p>{selectedItem.caption}</p>
              <div className="lightbox__actions">
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() =>
                    setSelectedIndex((current) =>
                      current <= 0 ? filteredItems.length - 1 : current - 1,
                    )
                  }
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="button button--ghost button--small"
                  onClick={() =>
                    setSelectedIndex((current) =>
                      current >= filteredItems.length - 1 ? 0 : current + 1,
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
