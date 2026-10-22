"use client";

import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";

import {
  Grid,
  Layout,
  Maximize2,
  Minimize2,
  Settings2,
  Pause,
  Play,
  UserSearch,
  CheckCircle,
  XCircle,
} from "lucide-react";


// ============================================================
// BACKEND CAMERA
// ============================================================

const CAMERA = {
  id: "camera_01",
  name: "Webcam",
  location: "Test Lab",
  status: "online",
};


// ============================================================
// BACKEND STREAM URL
// ============================================================

const STREAM_URL =
  "http://127.0.0.1:8000/api/v1/streaming/camera_01";


// ============================================================
// DETECTION API
// ============================================================

const DETECTION_URL =
  "http://127.0.0.1:8000/api/v1/detections";


// ============================================================
// Detection type
// ============================================================

type Detection = {
  track_id: number;
  candidate: string | null;
  similarity: number;
  observations: number;
  consistency: number;
  status: string;
  verification?: {
    status: string;
    candidate: string | null;
  };
};


// ============================================================
// Live camera component
// ============================================================

const LiveVideoCamera: React.FC<{
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}> = ({ isFullscreen, onToggleFullscreen }) => {

  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <Card
      className={`overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none"
          : "h-full"
      }`}
    >

      <div className="relative h-full">

        {/* Live MJPEG stream */}

        <div className="relative aspect-video h-full w-full bg-black">

          {isPlaying ? (

            <img
              src={STREAM_URL}
              alt="Live Webcam"
              className="h-full w-full object-contain"
            />

          ) : (

            <div className="flex h-full w-full items-center justify-center bg-black">

              <span className="rounded-md bg-black/70 px-4 py-2 text-sm text-white">
                Stream Paused
              </span>

            </div>

          )}


          {/* Camera status */}

          <div className="absolute left-2 top-2 flex items-center gap-2">

            <Badge
              variant="default"
              className="h-5 px-2 py-0"
            >
              {isPlaying ? "LIVE" : "PAUSED"}
            </Badge>

            <Badge
              variant="outline"
              className="bg-black/50 text-white"
            >
              {CAMERA.location}
            </Badge>

          </div>


          {/* Camera name */}

          <div className="absolute bottom-2 left-2">

            <h4 className="rounded bg-black/50 px-2 py-1 text-sm font-medium text-white">
              {CAMERA.name}
            </h4>

          </div>


          {/* Controls */}

          <div className="absolute bottom-2 right-2 flex gap-2">

            {/* Play / Pause */}

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsPlaying(!isPlaying)}
            >

              {isPlaying ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}

            </Button>


            {/* Fullscreen */}

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={onToggleFullscreen}
            >

              {isFullscreen ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}

            </Button>


            {/* Settings */}

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
            >

              <Settings2 size={16} />

            </Button>

          </div>

        </div>

      </div>

    </Card>
  );
};


// ============================================================
// Live View Page
// ============================================================

export default function LiveViewPage() {

  const [gridLayout, setGridLayout] =
    useState<"2x2" | "3x3">("2x2");

  const [fullscreenCamera, setFullscreenCamera] =
    useState(false);


  // ============================================================
  // Detection state
  // ============================================================

  const [detections, setDetections] =
    useState<Detection[]>([]);


  // ============================================================
  // Get detection results from backend
  // ============================================================

  useEffect(() => {

    const fetchDetections = async () => {

      try {

        const response = await fetch(
          DETECTION_URL
        );

        if (!response.ok) {

          throw new Error(
            "Failed to fetch detections"
          );

        }

        const data = await response.json();

        setDetections(
          data.detections || []
        );

      } catch (error) {

        console.error(
          "Detection API error:",
          error
        );

      }

    };


    // Get results immediately

    fetchDetections();


    // Then update every 1 second

    const interval = setInterval(
      fetchDetections,
      1000
    );


    return () => {

      clearInterval(interval);

    };

  }, []);


  // ============================================================
  // CONFIRM DETECTION
  // ============================================================

  const handleConfirm = async (
    trackId: number
  ) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/detections/${trackId}/confirm`,
        {
          method: "POST",
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
          "Failed to confirm detection"
        );

      }


      const data =
        await response.json();


      console.log(
        "Detection confirmed:",
        data
      );


      // Refresh detection data

      const updatedResponse =
        await fetch(DETECTION_URL);


      if (!updatedResponse.ok) {

        throw new Error(
          "Failed to refresh detections"
        );

      }


      const updatedData =
        await updatedResponse.json();


      setDetections(
        updatedData.detections || []
      );


    } catch (error) {

      console.error(
        "Confirm error:",
        error
      );

      alert(
        "Could not confirm the detection."
      );

    }

  };


  // ============================================================
  // REJECT DETECTION
  // ============================================================

  const handleReject = async (
    trackId: number
  ) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/detections/${trackId}/reject`,
        {
          method: "POST",
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
          "Failed to reject detection"
        );

      }


      const data =
        await response.json();


      console.log(
        "Detection rejected:",
        data
      );


      // Refresh detection data

      const updatedResponse =
        await fetch(DETECTION_URL);


      if (!updatedResponse.ok) {

        throw new Error(
          "Failed to refresh detections"
        );

      }


      const updatedData =
        await updatedResponse.json();


      setDetections(
        updatedData.detections || []
      );


    } catch (error) {

      console.error(
        "Reject error:",
        error
      );

      alert(
        "Could not reject the detection."
      );

    }

  };


  // ============================================================
  // PAGE
  // ============================================================

  return (

    <div className="flex h-full w-full flex-col space-y-4">


      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Live View
          </h1>

          <p className="text-muted-foreground">
            Monitor your cameras in real-time
          </p>

        </div>


        <div className="flex items-center gap-2">

          <Tabs
            defaultValue="all"
            className="w-[300px]"
          >

            <TabsList className="grid w-full grid-cols-3">

              <TabsTrigger value="all">
                All
              </TabsTrigger>

              <TabsTrigger value="indoor">
                Indoor
              </TabsTrigger>

              <TabsTrigger value="outdoor">
                Outdoor
              </TabsTrigger>

            </TabsList>

          </Tabs>


          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setGridLayout(
                gridLayout === "2x2"
                  ? "3x3"
                  : "2x2"
              )
            }
          >

            <Grid size={18} />

          </Button>


          <Button
            variant="outline"
            size="icon"
          >

            <Layout size={18} />

          </Button>

        </div>

      </div>


      {/* Camera grid */}

      <div
        className={`grid h-full gap-4 ${
          fullscreenCamera
            ? "grid-cols-1"
            : gridLayout === "2x2"
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >

        <LiveVideoCamera
          isFullscreen={fullscreenCamera}
          onToggleFullscreen={() =>
            setFullscreenCamera(!fullscreenCamera)
          }
        />

      </div>


      {/* ==================================================
          AI DETECTION RESULTS
          ================================================== */}

      <Card>

        <CardHeader className="py-3">

          <CardTitle className="flex items-center gap-2 text-sm font-medium">

            <UserSearch size={18} />

            AI Detection & Verification

            <Badge
              variant="outline"
              className="ml-auto"
            >

              {detections.length} Detection
              {detections.length !== 1 ? "s" : ""}

            </Badge>

          </CardTitle>

        </CardHeader>


        <CardContent>

          {detections.length === 0 ? (

            <div className="py-6 text-center">

              <p className="text-sm text-muted-foreground">
                No active detections
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Start Live View and keep a person in front of
                the camera for verification.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {detections.map((detection) => (

                <div
                  key={detection.track_id}
                  className="rounded-lg border p-4"
                >


                  {/* Top row */}

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm font-semibold">
                        Track ID: {detection.track_id}
                      </p>

                      <p className="text-lg font-bold">
                        {detection.candidate || "Unknown"}
                      </p>

                    </div>


                    <Badge
                      variant={
                        detection.status === "NO MATCH"
                          ? "secondary"
                          : "default"
                      }
                    >

                      {detection.verification
                        ? detection.verification.status
                        : detection.status}

                    </Badge>

                  </div>


                  {/* Statistics */}

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div className="rounded-md bg-muted p-3">

                      <p className="text-xs text-muted-foreground">
                        Similarity
                      </p>

                      <p className="text-lg font-bold">
                        {(detection.similarity * 100).toFixed(1)}%
                      </p>

                    </div>


                    <div className="rounded-md bg-muted p-3">

                      <p className="text-xs text-muted-foreground">
                        Observations
                      </p>

                      <p className="text-lg font-bold">
                        {detection.observations}/10
                      </p>

                    </div>


                    <div className="rounded-md bg-muted p-3">

                      <p className="text-xs text-muted-foreground">
                        Consistency
                      </p>

                      <p className="text-lg font-bold">
                        {detection.consistency.toFixed(1)}%
                      </p>

                    </div>


                    <div className="rounded-md bg-muted p-3">

                      <p className="text-xs text-muted-foreground">
                        Camera
                      </p>

                      <p className="text-lg font-bold">
                        {CAMERA.id}
                      </p>

                    </div>

                  </div>


                  {/* Human verification */}

                  {detection.status ===
                    "POSSIBLE MATCH - HUMAN VERIFICATION REQUIRED" &&
                    !detection.verification && (

                    <div className="mt-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">

                      <p className="text-sm font-medium">
                        Human verification required
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        The AI has identified a possible match.
                        A human must review and confirm or reject
                        the result.
                      </p>


                      <div className="mt-3 flex gap-2">

                        {/* CONFIRM */}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleConfirm(
                              detection.track_id
                            )
                          }
                        >

                          <CheckCircle
                            size={16}
                            className="mr-2"
                          />

                          Confirm

                        </Button>


                        {/* REJECT */}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReject(
                              detection.track_id
                            )
                          }
                        >

                          <XCircle
                            size={16}
                            className="mr-2"
                          />

                          Reject

                        </Button>

                      </div>

                    </div>

                  )}


                </div>

              ))}

            </div>

          )}

        </CardContent>

      </Card>


      {/* Camera statistics */}

      <Card className="mt-auto">

        <CardHeader className="py-3">

          <CardTitle className="text-sm font-medium">
            Camera Statistics
          </CardTitle>

        </CardHeader>


        <CardContent className="grid grid-cols-4 gap-4 py-2 text-center">

          <div>

            <p className="text-xs text-muted-foreground">
              Total Cameras
            </p>

            <p className="text-lg font-bold">
              1
            </p>

          </div>


          <div>

            <p className="text-xs text-muted-foreground">
              Online
            </p>

            <p className="text-lg font-bold">
              1
            </p>

          </div>


          <div>

            <p className="text-xs text-muted-foreground">
              Offline
            </p>

            <p className="text-lg font-bold">
              0
            </p>

          </div>


          <div>

            <p className="text-xs text-muted-foreground">
              Storage Used
            </p>

            <p className="text-lg font-bold">
              --
            </p>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}