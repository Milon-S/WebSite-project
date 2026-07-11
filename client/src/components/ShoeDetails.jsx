/**
 * ============================================================
 *  ShoeDetails.jsx  —  Footwear-Specific Product Widget Panel
 * ============================================================
 *  Rendered inside ProductDetails when product.category === 'footwear'.
 *  Contains three premium interactive widgets:
 *
 *  1. Dynamic Size Badge Grid
 *     Reads `stockBySize` map, renders interactive EU/UK size buttons.
 *     Sizes with stock === 0 receive the CSS `disabled` class and the
 *     HTML `disabled` attribute so they are fully unclickable.
 *
 *  2. UK / US Size Switcher Toggle
 *     A pill toggle that converts displayed size labels between UK and US
 *     numbering (US = UK + 1) without any page reload or API call.
 *
 *  3. Interactive Size Finder Widget
 *     A range slider accepting foot length in cm (22–31 cm).
 *     Uses a standard international footwear sizing chart to calculate
 *     the closest EU size and its UK/US equivalents, then highlights
 *     the recommended badge in the grid above.
 * ============================================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useShoeDetails } from '../js/app';

// ─── Standard Footwear Sizing Chart ─────────────────────────────────────────
// Each entry maps a foot-length range (cm) to EU, UK, and US sizes.
// Sources: ISO 19407 / Mondopoint; widely used international standard.
//
// cmMin / cmMax: The range of foot lengths (inclusive) that map to this size.
// euSize : EU numeric size (string, to match stockBySize keys)
// ukSize : UK numeric size
// usSize : US men's size  (UK + 1)
const SHOE_SIZE_CHART = [
  { cmMin: 22.0, cmMax: 22.6, euSize: '35', ukSize: 2,  usSize: 3  },
  { cmMin: 22.7, cmMax: 23.3, euSize: '36', ukSize: 3,  usSize: 4  },
  { cmMin: 23.4, cmMax: 24.0, euSize: '37', ukSize: 4,  usSize: 5  },
  { cmMin: 24.1, cmMax: 24.7, euSize: '38', ukSize: 5,  usSize: 6  },
  { cmMin: 24.8, cmMax: 25.4, euSize: '39', ukSize: 5.5, usSize: 6.5 },
  { cmMin: 25.5, cmMax: 25.9, euSize: '40', ukSize: 6,  usSize: 7  },
  { cmMin: 26.0, cmMax: 26.6, euSize: '41', ukSize: 7,  usSize: 8  },
  { cmMin: 26.7, cmMax: 27.3, euSize: '42', ukSize: 8,  usSize: 9  },
  { cmMin: 27.4, cmMax: 28.0, euSize: '43', ukSize: 9,  usSize: 10 },
  { cmMin: 28.1, cmMax: 28.7, euSize: '44', ukSize: 10, usSize: 11 },
  { cmMin: 28.8, cmMax: 29.4, euSize: '45', ukSize: 11, usSize: 12 },
  { cmMin: 29.5, cmMax: 30.1, euSize: '46', ukSize: 11.5, usSize: 12.5 },
  { cmMin: 30.2, cmMax: 31.0, euSize: '47', ukSize: 12, usSize: 13 },
];

// ─── Helper: find chart entry for a given cm value ────────────────────────────
/**
 * Returns the SHOE_SIZE_CHART entry that matches the given foot length.
 * @param {number} cm - Foot length in centimetres
 * @returns {object|null} Chart entry or null if out of range
 */
function findSizeFromCm(cm) {
  return SHOE_SIZE_CHART.find(
    (entry) => cm >= entry.cmMin && cm <= entry.cmMax
  ) || null;
}

// ─── Sub-Component: Size Badge ────────────────────────────────────────────────
/**
 * Individual size button badge.
 * @prop {string}  label       - Text to display (EU, UK, or US number)
 * @prop {boolean} inStock     - If false → disabled state
 * @prop {number}  stockCount  - Exact count shown on hover tooltip
 * @prop {boolean} isSelected  - Active/selected state
 * @prop {boolean} isRecommended - Highlighted by the Size Finder
 * @prop {string}  euSize      - EU size key for identifying the size
 * @prop {function} onSelect   - Callback when clicked
 */
function SizeBadge({
  label,
  inStock,
  stockCount,
  isSelected,
  isRecommended,
  euSize,
  onSelect,
}) {
  // Build the className string from state flags
  const classes = [
    'size-badge',
    !inStock     ? 'disabled'     : '',
    isSelected   ? 'active'       : '',
    isRecommended ? 'recommended' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Tooltip message reflects stock availability
  const tooltip = !inStock
    ? `EU ${euSize} — Sold Out`
    : `EU ${euSize} · ${stockCount} in stock`;

  return (
    <button
      className={classes}
      disabled={!inStock}            // HTML disabled attribute blocks all clicks
      title={tooltip}
      aria-label={`Size ${label}${!inStock ? ' (Sold Out)' : ''}`}
      onClick={() => inStock && onSelect(euSize)}
    >
      <span className="size-badge__label">{label}</span>
      {/* Sold-out diagonal strike line (CSS handles visibility) */}
      <span className="size-badge__strike" aria-hidden="true" />
      {/* Recommended indicator dot */}
      {isRecommended && (
        <span className="size-badge__recommended-dot" aria-label="Recommended size" />
      )}
    </button>
  );
}

// ─── Sub-Component: Size Switcher Toggle ─────────────────────────────────────
/**
 * A pill toggle switch that switches between 'uk' and 'us' size display.
 * @prop {'uk'|'us'} currentMode - Active mode
 * @prop {function}  onChange    - Callback(newMode)
 */
function SizeSwitcherToggle({ currentMode, onChange }) {
  return (
    <div className="size-switcher-wrapper" role="group" aria-label="Size system toggle">
      <span className="size-switcher-label">Size System:</span>
      <div className="size-switcher-toggle" role="radiogroup">
        {/* UK Option */}
        <button
          id="size-switch-uk"
          className={`size-switch-option ${currentMode === 'uk' ? 'active' : ''}`}
          role="radio"
          aria-checked={currentMode === 'uk'}
          onClick={() => onChange('uk')}
        >
          UK
        </button>
        {/* Animated Slider Pill */}
        <span
          className="size-switch-pill"
          style={{ transform: currentMode === 'us' ? 'translateX(100%)' : 'translateX(0)' }}
          aria-hidden="true"
        />
        {/* US Option */}
        <button
          id="size-switch-us"
          className={`size-switch-option ${currentMode === 'us' ? 'active' : ''}`}
          role="radio"
          aria-checked={currentMode === 'us'}
          onClick={() => onChange('us')}
        >
          US
        </button>
      </div>
    </div>
  );
}

// ─── Sub-Component: Size Finder Widget ───────────────────────────────────────
/**
 * A foot-length slider calculator that recommends a shoe size.
 * @prop {number}   footLengthCm     - Current slider value
 * @prop {function} onFootLengthChange - Callback(newCmValue)
 * @prop {object|null} recommendedEntry - The matched SHOE_SIZE_CHART entry
 * @prop {'uk'|'us'} sizeMode        - Current display mode
 */
function SizeFinderWidget({ footLengthCm, onFootLengthChange, recommendedEntry, sizeMode }) {
  // Determine which size label to emphasize based on current display mode
  const primaryLabel  = sizeMode === 'uk'
    ? (recommendedEntry ? `UK ${recommendedEntry.ukSize}` : '—')
    : (recommendedEntry ? `US ${recommendedEntry.usSize}` : '—');

  const euLabel       = recommendedEntry ? `EU ${recommendedEntry.euSize}` : '—';
  const cmDisplay     = Number(footLengthCm).toFixed(1);

  // Progress percentage for the custom range track fill
  const progressPct   = ((footLengthCm - 22) / (31 - 22)) * 100;

  return (
    <div className="size-finder-widget" id="shoe-size-finder">
      {/* Header */}
      <div className="size-finder-header">
        <i className="fa-solid fa-ruler size-finder-icon" aria-hidden="true" />
        <div>
          <h3 className="size-finder-title">Size Finder</h3>
          <p className="size-finder-subtitle">
            Measure your foot length for a perfect fit
          </p>
        </div>
      </div>

      {/* Slider input */}
      <div className="size-finder-slider-wrap">
        <div className="size-finder-slider-labels">
          <span>22 cm</span>
          <span className="size-finder-current-cm">
            <i className="fa-solid fa-foot size-finder-foot-icon" aria-hidden="true" />
            {cmDisplay} cm
          </span>
          <span>31 cm</span>
        </div>

        {/* Range slider — foot length in 0.1 cm increments */}
        <div className="size-finder-slider-container">
          <div
            className="size-finder-track-fill"
            style={{ width: `${progressPct}%` }}
          />
          <input
            type="range"
            id="foot-length-slider"
            className="size-finder-slider"
            min="22"
            max="31"
            step="0.1"
            value={footLengthCm}
            onChange={(e) => onFootLengthChange(parseFloat(e.target.value))}
            aria-label="Foot length in centimetres"
            aria-valuetext={`${cmDisplay} centimetres`}
          />
        </div>
      </div>

      {/* Result Output Panel */}
      {recommendedEntry ? (
        <div className="size-finder-result" role="status" aria-live="polite">
          <div className="size-finder-result-main">
            <span className="size-finder-result-size">{primaryLabel}</span>
            <span className="size-finder-result-eu">{euLabel}</span>
          </div>
          <div className="size-finder-result-info">
            <span>
              Foot length <strong>{cmDisplay} cm</strong> →{' '}
              {sizeMode === 'uk' ? `UK ${recommendedEntry.ukSize}` : `US ${recommendedEntry.usSize}`}{' '}
              (EU {recommendedEntry.euSize})
            </span>
          </div>
          <p className="size-finder-tip">
            <i className="fa-solid fa-circle-info" aria-hidden="true" /> The size above is now
            highlighted in the size grid. If between sizes, size up.
          </p>
        </div>
      ) : (
        <div className="size-finder-result size-finder-result--empty" role="status" aria-live="polite">
          <i className="fa-regular fa-circle-question" /> Foot length out of chart range.
          Please measure your foot carefully.
        </div>
      )}
    </div>
  );
}

// ─── Main Component: ShoeDetails ──────────────────────────────────────────────
/**
 * ShoeDetails — Footwear-specific variation panel.
 *
 * Integrates all three interactive shoe widgets. Designed to replace
 * the standard `product-variations` block in ProductDetails.jsx
 * when `product.category === 'footwear'`.
 *
 * Data strategy (two-layer):
 *   Layer 1 (immediate): product.stockBySize + product.ukSizes from getProductById
 *                        — used instantly so the grid renders without a loading flash.
 *   Layer 2 (enriched):  useShoeDetails → GET /api/products/:id/sizes
 *                        — replaces Layer 1 once the async fetch completes.
 *                        — adds server-validated stock, clean sizeStock array format.
 *
 * @prop {object}   product         - Full product object from getProductById / mock data
 * @prop {string}   selectedSize    - Currently selected EU size string
 * @prop {function} onSizeSelect    - Callback(euSize) when user selects a size
 */
export default function ShoeDetails({ product, selectedSize, onSizeSelect }) {
  // ── State ────────────────────────────────────────────────────────────────
  // sizeMode: 'uk' | 'us'  — controls what label system the badges show
  const [sizeMode, setSizeMode] = useState('uk');

  // footLengthCm: slider value from the Size Finder widget (22–31 cm)
  const [footLengthCm, setFootLengthCm] = useState(26.7); // Default ≈ EU 42 / UK 8

  // ── Fetch enriched size-stock data from the dedicated /sizes endpoint ──────
  // `product.id` may be a numeric mock ID or a MongoDB ObjectId string.
  const { shoeDetails } = useShoeDetails(product?.id);

  // ── Derived Data ─────────────────────────────────────────────────────────
  /**
   * Build a flat, sorted list of size entries.
   *
   * Priority:
   *  1. shoeDetails.sizeStock  — clean array from GET /api/products/:id/sizes
   *  2. product.stockBySize    — plain object from the product's own API response
   *
   * Each final entry shape: { euSize, ukSize, usSize, stock, inStock }
   */
  const sizeEntries = useMemo(() => {
    // ── Layer 2: enriched data from the dedicated /sizes endpoint ──────────
    if (shoeDetails?.sizeStock?.length > 0) {
      return shoeDetails.sizeStock.map((entry) => ({
        euSize:  entry.euSize,
        ukSize:  entry.ukSize,
        // US men's = UK + 1  (international convention, same as mock data)
        usSize:  entry.ukSize !== null ? entry.ukSize + 1 : null,
        stock:   entry.stock,
        inStock: entry.inStock,
      }));
    }

    // ── Layer 1: immediate fallback from product object (avoids loading flash) ─
    const rawMap = product.stockBySize || {};
    const ukArr  = product.ukSizes     || [];

    // Sort EU sizes numerically ascending
    return Object.keys(rawMap)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((euSize, idx) => {
        const stock  = rawMap[euSize];
        const ukSize = ukArr[idx] ?? null;
        return {
          euSize,
          ukSize,
          usSize:  ukSize !== null ? ukSize + 1 : null, // US men's = UK + 1
          stock,
          inStock: stock > 0,
        };
      });
  }, [shoeDetails, product.stockBySize, product.ukSizes]);

  // ── Size Finder: calculate recommended entry from slider value ────────────
  const recommendedEntry = useMemo(
    () => findSizeFromCm(footLengthCm),
    [footLengthCm]
  );
  const recommendedEuSize = recommendedEntry?.euSize ?? null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSizeModeChange = useCallback((mode) => setSizeMode(mode), []);
  const handleFootLengthChange = useCallback((cm) => setFootLengthCm(cm), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="shoe-details-panel" id="shoe-details-panel">

      {/* ── Section Header ── */}
      <div className="shoe-section-header">
        <span className="shoe-section-badge">
          <i className="fa-solid fa-shoe-prints" aria-hidden="true" /> Footwear
        </span>
        {/* Material pills — displayed in the header row */}
        <div className="shoe-material-pills">
          {product.upperMaterial && (
            <span className="material-pill material-pill--upper" title="Upper Material">
              <i className="fa-solid fa-tag" aria-hidden="true" />
              {product.upperMaterial}
            </span>
          )}
          {product.soleMaterial && (
            <span className="material-pill material-pill--sole" title="Sole Material">
              <i className="fa-solid fa-layer-group" aria-hidden="true" />
              {product.soleMaterial}
            </span>
          )}
        </div>
      </div>

      {/* ── Widget 2: UK / US Switcher Toggle ── */}
      {/*  Placed ABOVE the grid so the toggle visually controls the labels below */}
      <div className="shoe-size-controls-row">
        <div className="shoe-size-controls-label">
          Select Size
          {selectedSize && (
            <span className="shoe-selected-indicator">
              {/* Show selected size in both EU and the chosen system */}
              {(() => {
                const entry = sizeEntries.find((e) => e.euSize === selectedSize);
                if (!entry) return ` — EU ${selectedSize}`;
                const sys   = sizeMode === 'uk'
                  ? `UK ${entry.ukSize}`
                  : `US ${entry.usSize}`;
                return ` — ${sys} / EU ${entry.euSize}`;
              })()}
            </span>
          )}
        </div>
        <SizeSwitcherToggle
          currentMode={sizeMode}
          onChange={handleSizeModeChange}
        />
      </div>

      {/* ── Widget 1: Dynamic Size Badge Grid ── */}
      {sizeEntries.length > 0 ? (
        <div
          className="shoe-size-grid"
          id="shoe-size-grid"
          role="group"
          aria-label="Select shoe size"
        >
          {sizeEntries.map((entry) => {
            // Determine the label to display based on the current sizeMode
            const displayLabel =
              sizeMode === 'uk'
                ? (entry.ukSize !== null ? entry.ukSize : `EU${entry.euSize}`)
                : (entry.usSize !== null ? entry.usSize : `EU${entry.euSize}`);

            return (
              <SizeBadge
                key={entry.euSize}
                label={String(displayLabel)}
                inStock={entry.inStock}
                stockCount={entry.stock}
                isSelected={selectedSize === entry.euSize}
                isRecommended={recommendedEuSize === entry.euSize}
                euSize={entry.euSize}
                onSelect={onSizeSelect}
              />
            );
          })}
        </div>
      ) : (
        /* Fallback: no size data available */
        <p className="shoe-no-sizes">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          Size information is not available for this product.
        </p>
      )}

      {/* Stock status row: shows a quick summary beneath the grid */}
      <div className="shoe-stock-status-row" aria-live="polite">
        {selectedSize ? (
          (() => {
            const entry = sizeEntries.find((e) => e.euSize === selectedSize);
            if (!entry) return null;
            return entry.inStock ? (
              <span className="stock-chip stock-chip--in">
                <i className="fa-solid fa-circle-check" aria-hidden="true" />
                {entry.stock} in stock for EU {entry.euSize}
              </span>
            ) : (
              <span className="stock-chip stock-chip--out">
                <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
                EU {entry.euSize} is sold out
              </span>
            );
          })()
        ) : (
          <span className="stock-chip stock-chip--hint">
            <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
            Please select your size above
          </span>
        )}
      </div>

      {/* ── Widget 3: Interactive Size Finder ── */}
      <SizeFinderWidget
        footLengthCm={footLengthCm}
        onFootLengthChange={handleFootLengthChange}
        recommendedEntry={recommendedEntry}
        sizeMode={sizeMode}
      />
    </div>
  );
}
