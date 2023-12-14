Install Packages:
```shell
$ pip install openai pandas
```

To navigate to the folder holding the data, we use the cd (change directory) command:
```shell
cd Documents/apps/we-wingit
```
        
Start the data preparation and use the -f flag to identify the file where our data is stored:
```shell
openai tools fine_tunes.prepare_data -f <LOCAL_FILE>
```
for example:
```shell
openai tools fine_tunes.prepare_data -f we-wingit-data.csv
```

Now use that file when fine-tuning:
```shell
openai api fine_tunes.create -t we-wingit-data_prepared.jsonl -m davinci
```

After you’ve fine-tuned a model, remember that your prompt has to end with the indicator string ` ->` for the model to start generating completions, rather than continuing with the prompt. Make sure to include `stop=["\n"]` so that the generated texts ends at the expected place.
Once your model starts training, it'll approximately take 2.97 minutes to train a `curie` model, and less for `ada` and `babbage`. Queue will approximately take half an hour per job ahead of you.
