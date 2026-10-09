import studentData from "../data/studentData.json";

const DEFAULT_K = 3;
const DEFAULT_ITERATIONS = 50;

function distanceSquared(a, b) {
  return (a.study_hours - b.study_hours) ** 2 +
    (a.sleep_hours - b.sleep_hours) ** 2;
}

function mean(points) {
  return {
    study_hours: points.reduce((s, p) => s + p.study_hours, 0) / points.length,
    sleep_hours: points.reduce((s, p) => s + p.sleep_hours, 0) / points.length,
  };
}

function nearestCentroid(point, centroids) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  centroids.forEach((centroid, index) => {
    const d = distanceSquared(point, centroid);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = index;
    }
  });
  return bestIndex;
}

/**
 * Train K-means on the bundled unlabeled student examples.
 * Returns learned centroids and cluster memberships.
 */
export function trainStudentClusters(k = DEFAULT_K, maxIterations = DEFAULT_ITERATIONS) {
  if (!Number.isInteger(k) || k < 1 || k > studentData.length) {
    throw new Error("k must be an integer between 1 and the dataset size.");
  }

  // Deterministic initialization: spread initial centroids through the dataset.
  let centroids = Array.from({ length: k }, (_, i) => {
    const index = Math.floor(i * (studentData.length - 1) / Math.max(1, k - 1));
    return { ...studentData[index] };
  });

  let assignments = new Array(studentData.length).fill(-1);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let changed = false;

    assignments = studentData.map((point, index) => {
      const cluster = nearestCentroid(point, centroids);
      if (assignments[index] !== cluster) changed = true;
      return cluster;
    });

    const nextCentroids = centroids.map((oldCentroid, clusterIndex) => {
      const members = studentData.filter((_, i) => assignments[i] === clusterIndex);
      return members.length ? mean(members) : { ...oldCentroid };
    });

    centroids = nextCentroids;
    if (!changed) break;
  }

  return {
    centroids,
    assignments,
    counts: centroids.map((_, clusterIndex) =>
      assignments.filter((value) => value === clusterIndex).length
    ),
  };
}

const trained = trainStudentClusters();

function describeCluster(centroid) {
  const study = centroid.study_hours;
  const sleep = centroid.sleep_hours;

  if (study < 3) return "Lower study-hour group";
  if (study < 6.5) return "Moderate study-hour group";
  return "Higher study-hour group";
}

/**
 * Predict the nearest learned cluster for a new student's habits.
 * Inputs can be strings from React Native TextInput or numbers.
 */
export function predictStudentCluster(studyHours, sleepHours) {
  const study = Number(studyHours);
  const sleep = Number(sleepHours);

  if (!Number.isFinite(study) || study < 0 || study > 24) {
    throw new Error("Study hours must be between 0 and 24.");
  }
  if (!Number.isFinite(sleep) || sleep < 0 || sleep > 24) {
    throw new Error("Sleep hours must be between 0 and 24.");
  }

  const point = { study_hours: study, sleep_hours: sleep };
  const clusterIndex = nearestCentroid(point, trained.centroids);
  const centroid = trained.centroids[clusterIndex];

  return {
    model: "K-means clustering",
    prediction: `Cluster ${clusterIndex + 1}`,
    description: `${describeCluster(centroid)}. Cluster center: ${centroid.study_hours.toFixed(1)} study hours and ${centroid.sleep_hours.toFixed(1)} sleep hours per day.`,
    cluster: clusterIndex,
    centroid: {
      study_hours: Number(centroid.study_hours.toFixed(2)),
      sleep_hours: Number(centroid.sleep_hours.toFixed(2)),
    },
    clusterSize: trained.counts[clusterIndex],
  };
}
