import * as React from 'react';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { ButtonBase, CardMedia, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Dialog, DialogTitle, Pagination, FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Button, TextField, Box, AppBar, IconButton, Typography, Toolbar, CardContent, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import debounce from 'lodash/debounce';


function loadServerRows(page: number, gender: string, status: string, searchValue: string): Promise<any> {
  return fetch(`https://rickandmortyapi.com/api/character?page=${page}&gender=${gender}&status=${status}&name=${searchValue}`)
  .then(res => {
    return res.json()
  }).catch(error => {
    throw error;
    //i didnt handle errors
  });
}


export interface SimpleDialogProps {
  open: boolean;
  selectedValue: {name: string, img: string, firstEp: number, lastEp: number};
  onClose: () => void;
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose();
  };


  if(selectedValue){
    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>{selectedValue.name}</DialogTitle>
        <img src={selectedValue.img} loading="lazy" alt={selectedValue.name}/>
        <h4 style={{ marginLeft: '10px'}}>First apperence: {selectedValue.firstEp}</h4>
        <h4 style={{ marginLeft: '10px'}}>Last apperence: {selectedValue.lastEp}</h4>
      </Dialog>
    );
  } else {
    return (
      <Dialog onClose={handleClose} open={open}>
      </Dialog>
    );
  }
}

export default function ServerPaginationGrid() {
  const columns: GridColDef[] = [
    // { field: 'image', headerName: 'Image', width: 90 },
    { field: 'name', headerName: 'Character Name', width: 90 },
    { field: 'origin', headerName: 'Origin', width: 90 },
    { field: 'status', headerName: 'Status', width: 90 },
    { field: 'species', headerName: 'Species', width: 90 },
    { field: 'gender', headerName: 'Gender', width: 90 }
  ];
  const [page, setPage] = React.useState(0);
  const [gender, setGender] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [searchValue, setSearchValue] = React.useState<string>('');
  //nedded for rebounce
  const [searchValueTemp, setSearchValueTemp] = React.useState('');
  const [pagesCount, setPagesCount] = React.useState(0);
  const [viewType, setViewType] = React.useState('table');
  
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<any>(undefined);

  //for the popup
  const handleClickOpen = (val: any) => {
    setOpen(true);
    const lastNum: number = val.episode[0].lastIndexOf('/')+1;
    const lastNum2: number = val.episode[val.episode.length-1].lastIndexOf('/')+1;
    setSelectedValue({name: val.name, img: val.image, firstEp: val.episode[0].substring(lastNum), lastEp: val.episode[val.episode.length-1].substring(lastNum2)});
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedValue(undefined);
  };

  const handlePageChange = (event: any, value: React.SetStateAction<number>)  => {
    setPage(value);
  };

  
  React.useEffect(() => {
    let active = true;

    (async () => {
      const newRows = await loadServerRows(page, gender, status, searchValue);

      if (!active) {
        return;
      }

      if(newRows.hasOwnProperty('error')){
        setRows([]);
        setPagesCount(0);
      } else{
        setRows(newRows.results);
        setPagesCount(newRows.info.pages);
      }

    })();

    return () => {
      active = false;
    };
  }, [page, gender, status, searchValue]);

  //for the selects
  const genders = [
    'female',
    'male',
    'genderless',
    'unknown',
  ];
  const statuses = [
    'alive',
    'dead',
    'unknown',
  ];

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGender(event.target.value as string);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as string);
  };

  
  const debouncedSave = React.useCallback(
		debounce(searchValueTemp => setSearchValue(searchValueTemp), 1000),
		[], // will be created only once initially
	);
	// highlight-ends

	const debouncedEventHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value: searchValueTemp } = event.target;
		setSearchValueTemp(event.target.value as string);
		// Even though handleChange is created on each render and executed
		// it references the same debouncedSave that was created initially
		debouncedSave(searchValueTemp);
	};
  
  
  
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: string,
  ) => {
    setViewType(newViewType);
  };

  const clearAllFilters = () => {
    setStatus('');
    setGender('');
    setSearchValue('');
  };


  return (
    

    <div style={{ height: '98vh', paddingLeft: '1%', paddingRight: '1%'}}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="fixed">
          <Toolbar>
              <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Rick & Morty Characters App
              </Typography>
              <ToggleButtonGroup color='standard' value={viewType} exclusive onChange={handleViewChange}>
                <ToggleButton value="table">Table</ToggleButton>
                <ToggleButton value="cards">Cards</ToggleButton>
              </ToggleButtonGroup>
          </Toolbar>
        </AppBar>
      </Box>
      {'/* empty div just so the content dose not overlap */'}
      <div style={{height: '60px'}}></div>
      <TextField fullWidth id="outlined-basic" label="Search" value={searchValueTemp} onChange={debouncedEventHandler} variant="outlined" />
      <div style={{ paddingTop: '1%' }}>
        <FormControl sx={{ minWidth: 180, width: '40%' }}>
          <InputLabel id="demo-multiple-name-label">Gender</InputLabel>
          <Select labelId="demo-multiple-name-label" id="demo-multiple-name" value={gender} onChange={handleGenderChange} input={<OutlinedInput label="Name" />}>
            {genders.map((gen) => (
              <MenuItem key={gen} value={gen}>{gen}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180, width: '40%', marginLeft: '2%' }}>
          <InputLabel id="demo-multiple-name-label">Status</InputLabel>
          <Select labelId="demo-multiple-name-label" id="demo-multiple-name" value={status} onChange={handleStatusChange} input={<OutlinedInput label="Name" />} >
            {statuses.map((sta) => (
              <MenuItem key={sta} value={sta}>{sta}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button style={{ marginLeft: '2%', height: '50px' , width: '16%', minWidth: 'fit-content' }} variant="contained" onClick={clearAllFilters}>Clear all</Button>
      </div>
      
      {viewType === 'table'? 
        <TableContainer sx={{ height: '65%' }}>
          <Table sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
             stickyHeader >
            <TableHead>
              <TableRow>
              <TableCell style={{width: 35}}></TableCell>
                {columns.map(col => (
                  <TableCell key={col.headerName} align="left">{col.headerName}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((emp, rowIndex) => (
                <TableRow key={rowIndex} onClick={() => handleClickOpen(emp)}>
                  <TableCell style={{width: 35}}><Avatar alt="Remy Sharp" src={emp['image']} /></TableCell>
                  <TableCell align="left">{emp['name']}</TableCell>
                  <TableCell align="left">{emp['origin']['name']}</TableCell>
                  {['status', 'species', 'gender'].map((col, colIndex) => (
                    <TableCell key={colIndex} align="left">{emp[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
       :

        <div style={{ height: '65%', overflow: 'scroll' }}>
            <Grid container spacing={2} direction="row" alignItems="flex-start">
        {rows.map((emp, rowIndex) => (
          <Grid item xs={12} sm={6} md={3} key={rowIndex}>
              <ButtonBase onClick={() => handleClickOpen(emp)}>
                <CardMedia component="img" height="140" image={emp['image']} alt="green iguana"/>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {emp['name']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {emp['status']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {emp['species']}
                  </Typography>
                </CardContent>
              </ButtonBase>
              </Grid>
              ))}
              </Grid>
        </div>
      }

        {rows.length? <p></p>: <h2 style={{ textAlign: 'center'}}>No results for this search</h2>}

        <Pagination count={pagesCount} onChange={handlePageChange}/>
        
        <SimpleDialog
            selectedValue={selectedValue}
            open={open}
            onClose={handleClose}
          />
    </div>
  );
}