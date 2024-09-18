import { Chart } from 'chart.js/auto';
import * as d3 from 'd3';

export function generateVisualizationData(type, data) {
  switch (type) {
    case 'tokenDistribution':
      return prepareTokenDistributionData(data);
    case 'sentimentAnalysis':
      return prepareSentimentAnalysisData(data);
    case 'conceptMap':
      return prepareConceptMapData(data);
    case 'timeSeriesAnalysis':
      return prepareTimeSeriesData(data);
    default:
      throw new Error(`Unsupported visualization type: ${type}`);
  }
}

function prepareTokenDistributionData(tokens) {
  const tokenCounts = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(tokenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([token, count]) => ({ token, count }));
}

function prepareSentimentAnalysisData(sentiments) {
  const sentimentCounts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(sentimentCounts)
    .map(([sentiment, count]) => ({ sentiment, count }));
}

function prepareConceptMapData(concepts) {
  return {
    nodes: concepts.map(concept => ({ id: concept.name, group: concept.category })),
    links: concepts.flatMap(concept => 
      concept.related.map(related => ({ source: concept.name, target: related, value: 1 }))
    )
  };
}

function prepareTimeSeriesData(timeSeriesData) {
  return timeSeriesData.map(dataPoint => ({
    date: new Date(dataPoint.timestamp),
    value: dataPoint.value
  }));
}

export async function exportChart(element, format, fileName) {
  if (!(element instanceof HTMLCanvasElement)) {
    throw new Error('Element must be a canvas for chart export');
  }

  switch (format) {
    case 'png':
      return exportToPNG(element, fileName);
    case 'svg':
      return exportToSVG(element, fileName);
    case 'json':
      return exportToJSON(element, fileName);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

async function exportToPNG(canvas, fileName) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png');
  });
}

async function exportToSVG(canvas, fileName) {
  const ctx = canvas.getContext('2d');
  const svgString = d3.select(canvas).select('svg').node().outerHTML;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

async function exportToJSON(canvas, fileName) {
  const chart = Chart.getChart(canvas);
  if (!chart) {
    throw new Error('No Chart.js instance found for this canvas');
  }
  const data = {
    type: chart.config.type,
    data: chart.data,
    options: chart.options
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

export function createResponsiveChart(canvas, config) {
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    ...config,
    options: {
      ...config.options,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...config.options?.plugins,
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: config.options?.plugins?.title?.text || 'Chart Title'
        }
      }
    }
  });
}