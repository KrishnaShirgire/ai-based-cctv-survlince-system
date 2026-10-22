"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface Alert {
  id: number;
  track_id: number;
  person_id: string;
  similarity: number;
  observations: number;
  camera_id: string;
  camera_location: string;
  captured_image_path: string;
  captured_image_url: string;

  status: string;
  created_at: string;
  verified_at: string | null;

  // Missing person information
  name: string | null;
  age: number | null;
  gender: string | null;
  last_seen_location: string | null;
  last_seen_date: string | null;
  description: string | null;
  image_path: string | null;
  person_image_url: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/alerts`);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      setAlerts(data.alerts || []);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateAlert = async (
    alertId: number,
    action: "confirm" | "reject"
  ) => {
    setProcessingId(alertId);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/alerts/${alertId}/${action}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} alert`);
      }

      await fetchAlerts();
    } catch (error) {
      console.error(`Error trying to ${action} alert:`, error);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingAlerts = alerts.filter(
    (alert) => alert.status === "PENDING"
  ).length;

  const confirmedAlerts = alerts.filter(
    (alert) => alert.status === "CONFIRMED"
  ).length;

  const rejectedAlerts = alerts.filter(
    (alert) => alert.status === "REJECTED"
  ).length;

  return (
    <div className="p-6 space-y-6">

      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <div>
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-yellow-500" />

          <h1 className="text-3xl font-bold">
            Possible Matches
          </h1>
        </div>

        <p className="text-muted-foreground mt-2">
          Review possible missing-person matches detected by the AI
          surveillance system. Human verification is required before
          taking action.
        </p>
      </div>


      {/* ===================================================== */}
      {/* SUMMARY CARDS */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Total */}
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Total Alerts
          </p>

          <p className="text-3xl font-bold mt-2">
            {alerts.length}
          </p>
        </div>


        {/* Pending */}
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Pending Review
          </p>

          <p className="text-3xl font-bold mt-2 text-yellow-500">
            {pendingAlerts}
          </p>
        </div>


        {/* Confirmed */}
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Confirmed
          </p>

          <p className="text-3xl font-bold mt-2 text-green-500">
            {confirmedAlerts}
          </p>
        </div>


        {/* Rejected */}
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Rejected
          </p>

          <p className="text-3xl font-bold mt-2 text-red-500">
            {rejectedAlerts}
          </p>
        </div>

      </div>


      {/* ===================================================== */}
      {/* LOADING */}
      {/* ===================================================== */}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}


      {/* ===================================================== */}
      {/* NO ALERTS */}
      {/* ===================================================== */}

      {!loading && alerts.length === 0 && (
        <div className="rounded-lg border bg-card p-10 text-center">

          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500" />

          <h2 className="text-xl font-semibold">
            No Possible Matches
          </h2>

          <p className="text-muted-foreground mt-2">
            No AI-generated alerts are currently available.
          </p>

        </div>
      )}


      {/* ===================================================== */}
      {/* ALERT LIST */}
      {/* ===================================================== */}

      {!loading && alerts.length > 0 && (
        <div className="space-y-6">

          {alerts.map((alert) => (

            <div
              key={alert.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >

              {/* ================================================= */}
              {/* ALERT HEADER */}
              {/* ================================================= */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <div className="flex items-center gap-3">

                  <AlertTriangle className="w-6 h-6 text-yellow-500" />

                  <div>

                    <h2 className="text-xl font-semibold">
                      Possible Missing Person Match
                    </h2>

                    <p className="text-sm text-muted-foreground">
                      Alert #{alert.id}
                    </p>

                  </div>

                </div>


                {/* Status */}
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    alert.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : alert.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {alert.status}
                </div>

              </div>


              {/* ================================================= */}
              {/* IMAGE COMPARISON */}
              {/* ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* --------------------------------------------- */}
                {/* MISSING PERSON DATABASE IMAGE */}
                {/* --------------------------------------------- */}

                <div>

                  <p className="text-sm font-medium mb-2">
                    Missing Person Database Image
                  </p>

                  <div className="rounded-lg overflow-hidden border bg-muted min-h-[300px] flex items-center justify-center">

                    {alert.person_image_url ? (

                      <img
                        src={`${API_BASE}${alert.person_image_url}`}
                        alt={`Database image of ${alert.name || alert.person_id}`}
                        className="w-full max-h-[400px] object-contain"
                      />

                    ) : (

                      <div className="text-center text-muted-foreground p-6">

                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />

                        <p>
                          Database image unavailable
                        </p>

                      </div>

                    )}

                  </div>

                </div>


                {/* --------------------------------------------- */}
                {/* CCTV IMAGE */}
                {/* --------------------------------------------- */}

                <div>

                  <p className="text-sm font-medium mb-2">
                    Captured CCTV Camera Image
                  </p>

                  <div className="rounded-lg overflow-hidden border bg-muted min-h-[300px] flex items-center justify-center">

                    {alert.captured_image_url ? (

                      <img
                        src={`${API_BASE}${alert.captured_image_url}`}
                        alt="Captured CCTV camera frame"
                        className="w-full max-h-[400px] object-contain"
                      />

                    ) : (

                      <div className="text-center text-muted-foreground p-6">

                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />

                        <p>
                          Captured image unavailable
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>


              {/* ================================================= */}
              {/* MISSING PERSON DETAILS */}
              {/* ================================================= */}

              <div className="mt-6 rounded-lg border bg-muted/30 p-5">

                <h3 className="text-lg font-semibold mb-4">
                  Missing Person Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                  {/* Name */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Name
                    </p>

                    <p className="font-semibold">
                      {alert.name || "Not available"}
                    </p>

                  </div>


                  {/* ID */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Person ID
                    </p>

                    <p className="font-semibold">
                      {alert.person_id}
                    </p>

                  </div>


                  {/* Age */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Age
                    </p>

                    <p className="font-semibold">
                      {alert.age ?? "Not available"}
                    </p>

                  </div>


                  {/* Gender */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Gender
                    </p>

                    <p className="font-semibold">
                      {alert.gender || "Not available"}
                    </p>

                  </div>


                  {/* Last Seen Location */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Last Seen Location
                    </p>

                    <p className="font-semibold">
                      {alert.last_seen_location || "Not available"}
                    </p>

                  </div>


                  {/* Last Seen Date */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Last Seen Date
                    </p>

                    <p className="font-semibold">
                      {alert.last_seen_date || "Not available"}
                    </p>

                  </div>

                </div>


                {/* Description */}
                {alert.description && (
                  <div className="mt-5">

                    <p className="text-sm text-muted-foreground">
                      Description
                    </p>

                    <p className="mt-1">
                      {alert.description}
                    </p>

                  </div>
                )}

              </div>


              {/* ================================================= */}
              {/* AI MATCH INFORMATION */}
              {/* ================================================= */}

              <div className="mt-6 rounded-lg border p-5">

                <h3 className="text-lg font-semibold mb-4">
                  AI Detection Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                  {/* Similarity */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Similarity
                    </p>

                    <p className="text-xl font-bold">
                      {(alert.similarity * 100).toFixed(1)}%
                    </p>

                  </div>


                  {/* Observations */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Observations
                    </p>

                    <p className="text-xl font-bold">
                      {alert.observations}
                    </p>

                  </div>


                  {/* Camera */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Camera
                    </p>

                    <p className="font-semibold">
                      {alert.camera_id}
                    </p>

                  </div>


                  {/* Camera Location */}
                  <div>

                    <p className="text-sm text-muted-foreground">
                      Camera Location
                    </p>

                    <p className="font-semibold">
                      {alert.camera_location}
                    </p>

                  </div>

                </div>


                {/* Detection Time */}
                <div className="mt-5">

                  <p className="text-sm text-muted-foreground">
                    Detected At
                  </p>

                  <p className="font-medium">
                    {alert.created_at}
                  </p>

                </div>

              </div>


              {/* ================================================= */}
              {/* HUMAN VERIFICATION */}
              {/* ================================================= */}

              {alert.status === "PENDING" && (

                <div className="mt-6 pt-5 border-t">

                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-4">

                    <div className="flex gap-3">

                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />

                      <div>

                        <p className="font-medium text-yellow-800">
                          Human Verification Required
                        </p>

                        <p className="text-sm text-yellow-700 mt-1">
                          The AI system has identified a possible match.
                          Compare the database image with the captured
                          CCTV image before confirming the alert.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* Action Buttons */}

                  <div className="flex flex-wrap gap-3">

                    {/* Confirm */}
                    <button
                      onClick={() =>
                        updateAlert(alert.id, "confirm")
                      }
                      disabled={processingId === alert.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {processingId === alert.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}

                      Confirm Match

                    </button>


                    {/* Reject */}
                    <button
                      onClick={() =>
                        updateAlert(alert.id, "reject")
                      }
                      disabled={processingId === alert.id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                      {processingId === alert.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}

                      Reject

                    </button>

                  </div>

                </div>

              )}


              {/* ================================================= */}
              {/* VERIFICATION RESULT */}
              {/* ================================================= */}

              {alert.status === "CONFIRMED" && (

                <div className="mt-6 pt-5 border-t">

                  <div className="flex items-center gap-3 text-green-600">

                    <CheckCircle className="w-5 h-5" />

                    <div>

                      <p className="font-semibold">
                        Match Confirmed by Human Reviewer
                      </p>

                      {alert.verified_at && (
                        <p className="text-sm text-muted-foreground">
                          Verified at: {alert.verified_at}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              )}


              {alert.status === "REJECTED" && (

                <div className="mt-6 pt-5 border-t">

                  <div className="flex items-center gap-3 text-red-600">

                    <XCircle className="w-5 h-5" />

                    <div>

                      <p className="font-semibold">
                        Match Rejected by Human Reviewer
                      </p>

                      {alert.verified_at && (
                        <p className="text-sm text-muted-foreground">
                          Reviewed at: {alert.verified_at}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}