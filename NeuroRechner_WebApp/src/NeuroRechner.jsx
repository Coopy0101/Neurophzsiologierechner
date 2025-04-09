
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

const Nerven = [
  "Medianus",
  "Ulnaris distal",
  "Ulnaris proximal",
  "Peroneus",
  "Tibialis",
  "Radialis",
  "Suralis",
];

const Referenzwerte = {
  DML: { max: 4.5 },
  mNLG: { min: 45 },
  F: { max: 32 },
  AMP: { min: 5 },
  sNLG: { min: 45 },
};

export default function NeuroRechner() {
  const [werte, setWerte] = useState({});
  const [diagnose, setDiagnose] = useState("");
  const [zusatz, setZusatz] = useState({ PNP: false, CTS: false, UTS: false });

  const handleChange = (nerv, feld, value) => {
    setWerte({
      ...werte,
      [nerv]: {
        ...werte[nerv],
        [feld]: value,
      },
    });
  };

  const bewerten = () => {
    let pathoCount = 0;
    Object.values(werte).forEach((w) => {
      if (w.DML && parseFloat(w.DML) > Referenzwerte.DML.max) pathoCount++;
      if (w.mNLG && parseFloat(w.mNLG) < Referenzwerte.mNLG.min) pathoCount++;
      if (w.F && parseFloat(w.F) > Referenzwerte.F.max) pathoCount++;
    });
    if (pathoCount >= 4) setDiagnose("definite CIDP");
    else if (pathoCount >= 2) setDiagnose("probable CIDP");
    else if (pathoCount >= 1) setDiagnose("possible CIDP");
    else setDiagnose("kein Hinweis auf CIDP");

    const pnp = ["Medianus", "Suralis"].every(
      (n) => werte[n]?.AMP && parseFloat(werte[n].AMP) < 5
    );
    const cts =
      werte["Medianus"]?.DML && parseFloat(werte["Medianus"].DML) > 4.5;
    const uts =
      werte["Ulnaris proximal"]?.mNLG &&
      parseFloat(werte["Ulnaris proximal"].mNLG) < 45 &&
      werte["Ulnaris distal"]?.mNLG &&
      parseFloat(werte["Ulnaris distal"].mNLG) > 45;

    setZusatz({ PNP: pnp, CTS: cts, UTS: uts });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Neurophysiologischer Befundbericht", 20, 20);
    doc.setFontSize(12);
    doc.text(`Diagnose: ${diagnose}`, 20, 40);
    doc.text(`Zusatzdiagnosen:`, 20, 50);
    doc.text(`- PNP: ${zusatz.PNP ? "Hinweis" : "keine Hinweise"}`, 25, 60);
    doc.text(`- CTS: ${zusatz.CTS ? "Hinweis" : "keine Hinweise"}`, 25, 70);
    doc.text(`- UTS: ${zusatz.UTS ? "Hinweis" : "keine Hinweise"}`, 25, 80);
    doc.save("Befundbericht.pdf");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Neurophysiologie Rechner (Prototyp)</h1>
      {Nerven.map((nerv) => (
        <Card key={nerv}>
          <CardContent className="p-4 grid grid-cols-6 gap-2 items-center">
            <span className="font-medium col-span-6">{nerv}</span>
            {["DML", "mNLG", "F", "AMP", "sNLG"].map((feld) => (
              <Input
                key={feld}
                type="number"
                placeholder={feld}
                value={werte[nerv]?.[feld] || ""}
                onChange={(e) => handleChange(nerv, feld, e.target.value)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex gap-4">
        <Button onClick={bewerten}>Diagnose generieren</Button>
        <Button onClick={generatePDF} variant="outline">PDF exportieren</Button>
      </div>
      {diagnose && (
        <div className="p-4 border rounded-md shadow bg-white text-lg font-semibold">
          Automatische Diagnose: {diagnose}
          <ul className="text-base font-normal mt-2 list-disc list-inside">
            <li>PNP: {zusatz.PNP ? "Hinweis auf PNP" : "keine Hinweise"}</li>
            <li>CTS: {zusatz.CTS ? "Hinweis auf CTS" : "keine Hinweise"}</li>
            <li>UTS: {zusatz.UTS ? "Hinweis auf UTS" : "keine Hinweise"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
