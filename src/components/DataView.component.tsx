import { Avatar, ButtonBase, CardContent, CardMedia, Dialog, DialogTitle, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";

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
  //needed because for some reason its called on init
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

//handling the popup and passing down to table and card view
export function DataView(props: any){
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<any>(undefined);
  
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

  return (
    <React.Fragment >
      {props.viewType === 'table'? 
        <TableView rows={props.rows} onChildClick={handleClickOpen}/>
        :
        <CardView rows={props.rows} onChildClick={handleClickOpen}/>
      }
      {props.rows.length? <p></p>: <h2 style={{ textAlign: 'center'}}>No results for this search</h2>}
      <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose}/>
    </React.Fragment>
  );
}

function TableView(props: any){
  return (
    <TableContainer sx={{ height: '67%' }}>
      <Table sx={{ minWidth: 750 }}
        aria-labelledby="tableTitle"
          stickyHeader >
        <TableHead>
          <TableRow>
            <TableCell style={{width: 35}}></TableCell>
              {['Character Name', 'Origin', 'Status', 'Species', 'Gender'].map(col => (
                <TableCell key={col} align="left">{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((emp: any, rowIndex: number) => (
            <TableRow hover key={rowIndex} onClick={() => props.onChildClick(emp)}>
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
  );
}

function CardView(props: any){
  return (
    <div style={{ height: '67%', overflow: 'auto' }}>
      <Grid container spacing={2} direction="row" alignItems="flex-start">
        {props.rows.map((emp: any, rowIndex: number) => (
          <Grid item xs={12} sm={6} md={3} key={rowIndex}>
              <ButtonBase onClick={() => props.onChildClick(emp)}>
                <CardMedia component="img" sx={{ width: 151 }} image={emp['image']} alt="green iguana"/>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {emp['name']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {emp['status']}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Species: {emp['species']}
                  </Typography>
                </CardContent>
              </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
