"use client";
import InlineDownloadGate from "./InlineDownloadGate";

// About page: gated capability statement download.
export default function CapabilityRequest() {
  return (
    <InlineDownloadGate
      resource="capability-statement"
      itemName="Your capability statement"
      submitLabel="GET THE STATEMENT"
      downloadLabel="Download the statement"
    />
  );
}
