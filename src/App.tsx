import { GridRowsProp } from '@mui/x-data-grid';
import { Pagination, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Button, TextField, Box, AppBar, IconButton, Typography, Toolbar, ToggleButton, ToggleButtonGroup } from '@mui/material';
import debounce from 'lodash/debounce';
import React from 'react';
import { DataView } from './components/DataView.component';
//check classes vs functions. looks like theres a difference in the render
//maybe i should have done a service for the params (defintly if i do routing). (needed for bigger apps)
//for the selects
const genders = ['female', 'male', 'genderless', 'unknown'];
const statuses = ['alive', 'dead', 'unknown'];


function loadServerRows(page: number, gender: string, status: string, searchValue: string): Promise<any> {
  return fetch(`https://rickandmortyapi.com/api/character?page=${page}&gender=${gender}&status=${status}&name=${searchValue}`)
  .then(res => {
    return res.json()
  }).catch(error => {
    throw error;
    //i didnt handle errors
  });
}




export default function ServerPaginationGrid() {
  const [page, setPage] = React.useState(0);
  const [gender, setGender] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [searchValue, setSearchValue] = React.useState<string>('');
  //nedded for rebounce
  const [searchValueTemp, setSearchValueTemp] = React.useState('');
  const [pagesCount, setPagesCount] = React.useState(0);

  const [pages, setPages] = React.useState({});

  const [viewType, setViewType] = React.useState('table');
  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newViewType: string) => {
    setViewType(newViewType);
  };

  const handlePageChange = (event: any, value: React.SetStateAction<number>)  => {
    setPage(value);
  };


  React.useEffect(() => {
    //prevent calling backend twice on init (i still dont know why when i set in code it dose not call)
    if(!page) return;
    if(pages.hasOwnProperty(page)){
      setRows(pages[page]);
      return;
    }
    let active = true;

    (async () => {
      const newRows = await loadServerRows(page, gender, status, searchValue);

      if (!active) {
        return;
      }

      setRows(newRows.results);
      setPages({
        ...pages,
        [page]: newRows.results
      });
    })();

    return () => {
      active = false;
    };
  }, [page]);
  
  React.useEffect(() => {
    let active = true;
    

    (async () => {
      const newRows = await loadServerRows(0, gender, status, searchValue);
      
      if (!active) {
        return;
      }

      if(newRows.hasOwnProperty('error')){
        setRows([]);
        setPagesCount(0);
      } else{
        //not needed because setpage fire the top one
        // setRows(newRows.results);
        setPages({1: newRows.results});
        setPage(1);
        setPagesCount(newRows.info.pages);
      }

    })();

    return () => {
      active = false;
    };
  }, [gender, status, searchValue]);


  const debouncedSave = React.useCallback(
		debounce(searchValueTemp => setSearchValue(searchValueTemp), 1000),
		[], // will be created only once initially
	);
  // i still dont see why a listener is better then calling it manually
  React.useEffect(() => {
    debouncedSave(searchValueTemp);
  }, [searchValueTemp]);

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGender(event.target.value as string);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

	const handleTempSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValueTemp(event.target.value as string);
	};

  const clearAllFilters = () => {
    setStatus('');
    setGender('');
    setSearchValueTemp('');
    setSearchValue('');
  };

  return (
    <div style={{ height: '98vh', paddingLeft: '1%', paddingRight: '1%'}}>
      <HeaderView handleViewChange={handleViewChange}/>
      {'/* empty div just so the content dose not overlap */'}
      <div style={{height: '60px'}}></div>
      <TextField fullWidth id="outlined-basic" label="Search" value={searchValueTemp} onChange={handleTempSearchChange} variant="outlined" />
      <div style={{ paddingTop: '1%' }}>
        <SelectGender gender={gender} handleGenderChange={handleGenderChange}/>
        <SelectStatus status={status} handleStatusChange={handleStatusChange}/>
        <Button style={{ marginLeft: '2%', height: '50px' , width: '16%', minWidth: 'fit-content' }} variant="contained" onClick={clearAllFilters}>Clear all</Button>
      </div>
      
      <DataView rows={rows} viewType={viewType}/>

      <Pagination style={{position:'absolute',left:0,bottom:0,right:0}} page={page} count={pagesCount} onChange={handlePageChange}/>
    </div>
  );
}

function HeaderView(props: any){
  return(
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
            <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Rick & Morty Characters App
            </Typography>
            <ToggleButtonGroup color='standard' value={props.viewType} exclusive onChange={props.handleViewChange}>
              <ToggleButton value="table">Table</ToggleButton>
              <ToggleButton value="cards">Cards</ToggleButton>
            </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
    </Box>
  );
}



function SelectGender(props: any){
  return(
    <FormControl sx={{ minWidth: 180, width: '40%' }}>
      <InputLabel id="demo-multiple-name-label">Gender</InputLabel>
      <Select labelId="demo-multiple-name-label" id="demo-multiple-name" value={props.gender} onChange={props.handleGenderChange} input={<OutlinedInput label="Name" />}>
        {genders.map((gen) => (
          <MenuItem key={gen} value={gen}>{gen}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function SelectStatus(props: any){
  return(
    <FormControl sx={{ minWidth: 180, width: '40%' }}>
      <InputLabel id="demo-multiple-name-label">Gender</InputLabel>
      <Select labelId="demo-multiple-name-label" id="demo-multiple-name" value={props.status} onChange={props.handleStatusChange} input={<OutlinedInput label="Name" />}>
        {statuses.map((gen) => (
          <MenuItem key={gen} value={gen}>{gen}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}