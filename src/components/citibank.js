import React from "react";
import { useState } from "react";
import terraformFiles from "../data/terraformFiles";

// Keywords worth calling out in HCL (Terraform's config language) - block
// types plus the handful of top-level meta-arguments that show up across
// these files.
const KEYWORDS = new Set([
  "resource", "data", "variable", "output", "provider", "terraform",
  "locals", "module", "required_providers", "required_version",
  "for_each", "count", "lifecycle", "depends_on", "dynamic",
  "type", "default", "description", "statement", "principals", "backend",
]);

const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Comments / strings / literals / numbers / bare words, in priority order.
// A single pass over the source avoids re-matching text that's already
// been wrapped in a span (which naive sequential regex replaces would do).
const TOKEN_PATTERN =
  /(#[^\n]*|\/\/[^\n]*)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|\b(\d+(?:\.\d+)?)\b|\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;

const highlightHCL = (code) => {
  let result = "";
  let lastIndex = 0;
  let match;

  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(code)) !== null) {
    result += escapeHtml(code.slice(lastIndex, match.index));
    const [, comment, string, literal, number, word] = match;

    if (comment) {
      result += `<span class="tf-comment">${escapeHtml(comment)}</span>`;
    } else if (string) {
      result += `<span class="tf-string">${escapeHtml(string)}</span>`;
    } else if (literal) {
      result += `<span class="tf-literal">${escapeHtml(literal)}</span>`;
    } else if (number) {
      result += `<span class="tf-number">${escapeHtml(number)}</span>`;
    } else if (word) {
      result += KEYWORDS.has(word)
        ? `<span class="tf-keyword">${escapeHtml(word)}</span>`
        : escapeHtml(word);
    }

    lastIndex = TOKEN_PATTERN.lastIndex;
  }
  result += escapeHtml(code.slice(lastIndex));
  return result;
};

const CitiBank = () => {
  const [expanded, setExpanded] = useState(() =>
    terraformFiles.reduce((acc, file, index) => {
      acc[file.name] = index === 0;
      return acc;
    }, {})
  );
  const [copiedFile, setCopiedFile] = useState("");

  const allExpanded = terraformFiles.every((file) => expanded[file.name]);

  const toggleFile = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const setAll = (value) => {
    setExpanded(
      terraformFiles.reduce((acc, file) => {
        acc[file.name] = value;
        return acc;
      }, {})
    );
  };

  const copyCode = async (file) => {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopiedFile(file.name);
      setTimeout(() => setCopiedFile(""), 1500);
    } catch (err) {
      console.log("Error copying terraform file to clipboard: \n" + err.message);
    }
  };

  return (
    <div
      className="terraformPage fadeInStaggered--1"
      role="main"
      aria-label="Terraform infrastructure files"
    >
      <div className="terraformPageHeader">
        <h1 role="heading" aria-level="1">
          Terraform Infrastructure
        </h1>
        <p className="terraformPageSubtitle">
          React-FastAPI-Postgres-Template / infra
        </p>
        <div className="terraformPageActions">
          <button
            type="button"
            className="terraformActionButton"
            onClick={() => setAll(true)}
            disabled={allExpanded}
          >
            Expand All
          </button>
          <button
            type="button"
            className="terraformActionButton"
            onClick={() => setAll(false)}
          >
            Collapse All
          </button>
        </div>
      </div>

      <ul className="tfGroupList" role="list">
        {terraformFiles.map((file) => {
          const isOpen = !!expanded[file.name];
          const lineCount = file.code.split("\n").length;

          return (
            <li className="tfGroup" key={file.name}>
              <button
                type="button"
                className="tfGroupHeader"
                onClick={() => toggleFile(file.name)}
                aria-expanded={isOpen}
                aria-controls={`tf-body-${file.name}`}
              >
                <img
                  className={`tfChevron${isOpen ? " open" : ""}`}
                  src="/chevronDownGrey.svg"
                  alt=""
                  aria-hidden="true"
                />
                <span className="tfFileName">{file.name}</span>
                <span className="tfLineCount">{lineCount} lines</span>
              </button>

              <div
                className={`tfGroupBodyWrapper${isOpen ? " open" : ""}`}
                id={`tf-body-${file.name}`}
              >
                <div className="tfGroupBodyInner">
                  <div className="tfCodeToolbar">
                    <button
                      type="button"
                      className="tfCopyButton"
                      onClick={() => copyCode(file)}
                      aria-label={`Copy contents of ${file.name}`}
                    >
                      {copiedFile === file.name ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <pre className="tfCode scroll-container">
                    <code
                      dangerouslySetInnerHTML={{
                        __html: highlightHCL(file.code),
                      }}
                    />
                  </pre>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CitiBank;
