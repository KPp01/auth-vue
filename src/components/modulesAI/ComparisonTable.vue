<template>
    <div class="comparison-table">
      <h2>{{ title }}</h2>
      
      <!-- Wyszukiwarka -->
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('table.searchPlaceholder')"
          class="search-input"
        />
      </div>
  
      <!-- Tabela -->
      <table class="table">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="index" @click="sortTable(index)">
              {{ header }}
              <span v-if="sortedColumn === index">
                <span v-if="isAscending">▲</span>
                <span v-else>▼</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in filteredRows" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              {{ formatCell(cell, cellIndex) }}
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Paginacja -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          {{ $t('table.prev') }}
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          {{ $t('table.next') }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ComparisonTable',
    props: {
      title: {
        type: String,
        default: 'Comparison Table',
      },
      headers: {
        type: Array,
        default: () => ['Column 1', 'Column 2', 'Column 3'],
      },
      rows: {
        type: Array,
        default: () => [
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
          // więcej danych
        ],
      },
      itemsPerPage: {
        type: Number,
        default: 10,
      },
    },
    data() {
      return {
        searchQuery: '',
        currentPage: 1,
        sortedColumn: null,
        isAscending: true,
      };
    },
    computed: {
      filteredRows() {
        // Filtracja wyników na podstawie zapytania wyszukiwania
        let filtered = this.rows.filter((row) => {
          return row.some((cell) =>
            String(cell).toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        });
  
        // Sortowanie
        if (this.sortedColumn !== null) {
          filtered.sort((a, b) => {
            const cellA = a[this.sortedColumn];
            const cellB = b[this.sortedColumn];
  
            if (this.isAscending) {
              return cellA > cellB ? 1 : -1;
            } else {
              return cellA < cellB ? 1 : -1;
            }
          });
        }
  
        // Paginacja
        return filtered.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        );
      },
      totalPages() {
        return Math.ceil(this.rows.length / this.itemsPerPage);
      },
    },
    methods: {
      formatCell(cell, cellIndex) {
        // Możesz tutaj dodać bardziej zaawansowaną logikę formatowania
        return cell;
      },
      sortTable(columnIndex) {
        if (this.sortedColumn === columnIndex) {
          this.isAscending = !this.isAscending;
        } else {
          this.sortedColumn = columnIndex;
          this.isAscending = true;
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage += 1;
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage -= 1;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .comparison-table {
    width: 100%;
    margin: 0 auto;
    padding: 20px;
  }
  
  .search-bar {
    margin-bottom: 10px;
  }
  
  .search-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
  }
  
  .table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  
  .table th {
    cursor: pointer;
    padding: 10px;
    background-color: #f0f0f0;
  }
  
  .table td {
    padding: 10px;
    border: 1px solid #ccc;
  }
  
  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  
  .pagination button {
    padding: 5px 10px;
  }
  </style>
  