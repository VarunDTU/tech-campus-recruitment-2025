## First Approach: Using Stream or pipline on single thread operation 

## Second Approach: 
Solutions Considered: Parallel log extraction using node workers

Final Solution Summary: 
Optimized log extraction from large files using Worker Threads for parallel processing. 
The main thread first determines the file size and splits it into multiple chunks, assigning each chunk to a separate worker. 
Each worker thread processes only its assigned chunk, filtering log entries that start with the specified date and saving them to a temporary file.
Once all workers finish, the main thread merges these temporary files into a single final output file.

Steps to Run: 
    1. put your logs_2024.log file in /src
    2 .on cmd run "node extract_logs.js {YYYY-MM-DD}"
    3. output_YYYY-MM-DD.txt file gets created at /output
    
            